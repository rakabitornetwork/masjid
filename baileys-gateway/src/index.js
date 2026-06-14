import express from 'express';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import dotenv from 'dotenv';
import path from 'path';
import { rm } from 'fs/promises';
import makeWASocket, {
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateMessageIDV2,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';

dotenv.config();

const PORT = Number(process.env.PORT || 3002);
const BAILEYS_TOKEN = String(process.env.BAILEYS_TOKEN || '').trim();
const SESSION_DIR = String(process.env.BAILEYS_SESSION_DIR || '.baileys_masjid_auth').trim();
const SESSION_DIR_ABS = path.isAbsolute(SESSION_DIR)
    ? path.normalize(SESSION_DIR)
    : path.resolve(process.cwd(), SESSION_DIR);
const BAILEYS_DEVICE_NAME = String(process.env.BAILEYS_DEVICE_NAME || 'Masjid Gateway').trim();
const BAILEYS_BROWSER_NAME = String(process.env.BAILEYS_BROWSER_NAME || 'Chrome').trim();
const BAILEYS_DEVICE_OS = String(process.env.BAILEYS_DEVICE_OS || 'Aplikasi Manajemen Masjid').trim();
const BAILEYS_BROWSER_VERSION = String(process.env.BAILEYS_BROWSER_VERSION || '120.0.6099.129').trim();
const DELIVERY_ACK_TIMEOUT_MS = Number(process.env.BAILEYS_DELIVERY_ACK_TIMEOUT_MS || 15000);
const pendingDeliveryAcks = new Map();
const pendingOutboundSync = new Map();
const sentMessageCache = new Map();
const MIN_SERVER_ACK_STATUS = 1;
const MIN_STRONG_DELIVERY_ACK_STATUS = 2;

if (!BAILEYS_TOKEN) {
    throw new Error('BAILEYS_TOKEN wajib diisi di environment.');
}

const app = express();
app.use(express.json({ limit: '256kb' }));

const logger = pino({ level: 'info' });

let sock = null;
let isConnected = false;
let lastConnection = null;
let lastQr = null;
let reconnectTimer = null;

const normalizePhone = (rawPhone) => {
    const digits = String(rawPhone || '').replace(/\D/g, '');

    if (!digits) {
        return null;
    }

    if (digits.startsWith('62')) {
        return digits;
    }

    if (digits.startsWith('0')) {
        return `62${digits.slice(1)}`;
    }

    if (digits.startsWith('8')) {
        return `62${digits}`;
    }

    return digits;
};

const formatLinkedPhone = (userId) => {
    if (!userId || typeof userId !== 'string') {
        return null;
    }

    const bare = userId.split('@')[0] || '';
    const phonePart = bare.includes(':') ? bare.split(':')[0] : bare;
    const digits = phonePart.replace(/\D/g, '');

    return digits || null;
};

const getSessionHealth = () => {
    const wsOpen = Boolean(sock?.ws?.isOpen);
    const linkedUser = sock?.user?.id ?? null;
    const linkedPhone = formatLinkedPhone(linkedUser);
    const sessionReady = wsOpen && Boolean(linkedUser) && isConnected;

    return {
        connected: isConnected,
        ws_open: wsOpen,
        linked_user: linkedUser,
        linked_phone: linkedPhone,
        connection_state: lastConnection,
        session_ready: sessionReady,
        zombie_session: isConnected && !sessionReady,
    };
};

const getConnectedProfilePhotoUrl = async (linkedUser) => {
    if (!sock || !linkedUser) {
        return null;
    }

    try {
        return await sock.profilePictureUrl(linkedUser, 'image');
    } catch (error) {
        logger.warn({ err: error, linked_user: linkedUser }, 'Gagal mengambil foto profil WhatsApp.');
        return null;
    }
};

const ackMeetsMin = (ack, minStatus) => {
    if (typeof ack === 'number') {
        return ack >= minStatus;
    }

    return ack === 'receipt' && minStatus <= MIN_SERVER_ACK_STATUS;
};

const resolvePendingAck = (messageId, result) => {
    const pending = pendingDeliveryAcks.get(messageId);

    if (!pending || !ackMeetsMin(result.ack, pending.minStatus)) {
        return false;
    }

    clearTimeout(pending.timer);
    pendingDeliveryAcks.delete(messageId);
    pending.resolve({ ...result, status: 'acked' });

    return true;
};

const resolveOutboundSync = (messageId, result) => {
    const pending = pendingOutboundSync.get(messageId);

    if (!pending) {
        return false;
    }

    clearTimeout(pending.timer);
    pendingOutboundSync.delete(messageId);
    pending.resolve(result);

    return true;
};

const waitForMessageAck = (messageId, minStatus = MIN_SERVER_ACK_STATUS, timeoutMs = DELIVERY_ACK_TIMEOUT_MS) => new Promise((resolve) => {
    if (!messageId) {
        resolve({ status: 'skipped', ack: null });
        return;
    }

    const timer = setTimeout(() => {
        pendingDeliveryAcks.delete(messageId);
        resolve({ status: 'timeout', ack: null });
    }, timeoutMs);

    pendingDeliveryAcks.set(messageId, { resolve, timer, minStatus });
});

const waitForOutboundSync = (messageId, timeoutMs = DELIVERY_ACK_TIMEOUT_MS) => new Promise((resolve) => {
    if (!messageId) {
        resolve({ status: 'skipped' });
        return;
    }

    const timer = setTimeout(() => {
        pendingOutboundSync.delete(messageId);
        resolve({ status: 'timeout' });
    }, timeoutMs);

    pendingOutboundSync.set(messageId, { resolve, timer });
});

const attachDeliveryListeners = (socket) => {
    socket.ev.on('messages.update', (updates) => {
        for (const { key, update } of updates) {
            if (!key?.id || update?.status === undefined) {
                continue;
            }

            resolvePendingAck(key.id, { status: 'acked', ack: update.status });
        }
    });

    socket.ev.on('message-receipt.update', (updates) => {
        for (const { key } of updates) {
            if (!key?.id) {
                continue;
            }

            resolvePendingAck(key.id, { status: 'acked', ack: 'receipt' });
        }
    });

    socket.ev.on('messages.upsert', ({ messages }) => {
        for (const message of messages) {
            const id = message?.key?.id;

            if (!id) {
                continue;
            }

            sentMessageCache.set(id, message);

            if (message?.key?.fromMe) {
                resolveOutboundSync(id, { status: 'synced', source: 'upsert' });
            }
        }
    });
};

const canAutoWipeSession = (absPath) => {
    const resolved = path.resolve(absPath);
    const cwd = path.resolve(process.cwd());

    if (resolved === cwd || resolved.length < 6) {
        return false;
    }

    const { root } = path.parse(resolved);

    return !(root && (resolved === root || resolved === root.replace(/[/\\]$/, '')));
};

const wipeSession = async () => {
    if (!canAutoWipeSession(SESSION_DIR_ABS)) {
        logger.warn({ session_dir_absolute: SESSION_DIR_ABS }, 'Session tidak dihapus otomatis karena path dianggap tidak aman.');
        return;
    }

    await rm(SESSION_DIR_ABS, { recursive: true, force: true });
    logger.info({ session_dir_absolute: SESSION_DIR_ABS }, 'Folder session berhasil dihapus.');
};

const scheduleReconnect = (delayMs) => {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
    }

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        void startSock().catch((err) => logger.error({ err }, 'startSock failed'));
    }, delayMs);
};

const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR_ABS);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: [BAILEYS_DEVICE_OS, BAILEYS_BROWSER_NAME, BAILEYS_BROWSER_VERSION],
        markOnlineOnConnect: false,
        syncFullHistory: false,
        emitOwnEvents: true,
        getMessage: async (key) => sentMessageCache.get(key?.id)?.message,
    });

    sock.ev.on('creds.update', saveCreds);
    attachDeliveryListeners(sock);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection) {
            lastConnection = connection;
        }

        if (qr) {
            lastQr = qr;
            logger.info('QR baru tersedia. Scan dari WhatsApp untuk login gateway masjid.');
            qrcodeTerminal.generate(qr, { small: true });
        }

        if (connection === 'open') {
            isConnected = true;
            lastQr = null;
            logger.info({ user: sock?.user?.id }, 'Baileys gateway masjid connected.');
        }

        if (connection === 'close') {
            isConnected = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut;
            logger.warn({ statusCode }, 'Baileys gateway masjid disconnected.');

            if (isLoggedOut) {
                void wipeSession()
                    .catch((err) => logger.error({ err }, 'Gagal menghapus session setelah logout.'))
                    .finally(() => scheduleReconnect(2000));
                return;
            }

            scheduleReconnect(2000);
        }
    });
};

const bearerAuth = (req, res, next) => {
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';

    if (!token || token !== BAILEYS_TOKEN) {
        return res.status(401).json({
            ok: false,
            message: 'Unauthorized',
        });
    }

    return next();
};

const assertSessionReady = () => {
    const health = getSessionHealth();

    if (!sock) {
        return { ok: false, status: 503, message: 'Baileys belum diinisialisasi. Restart gateway.' };
    }

    if (!health.session_ready) {
        const hint = health.zombie_session
            ? 'Sesi WhatsApp tidak aktif. Hapus session, restart gateway, lalu scan QR ulang.'
            : 'Baileys belum terkoneksi. Scan QR dan pastikan status connected.';

        return { ok: false, status: 503, message: hint, health };
    }

    return { ok: true, health };
};

app.get('/health', async (_req, res) => {
    const session = getSessionHealth();
    const profilePhotoUrl = session.session_ready
        ? await getConnectedProfilePhotoUrl(session.linked_user)
        : null;

    res.json({
        ok: true,
        connected: session.connected,
        has_qr: Boolean(lastQr),
        session_dir: SESSION_DIR,
        session_dir_absolute: SESSION_DIR_ABS,
        process_cwd: process.cwd(),
        process_pid: process.pid,
        device_name: BAILEYS_DEVICE_NAME,
        browser_name: BAILEYS_BROWSER_NAME,
        device_os: BAILEYS_DEVICE_OS,
        ws_open: session.ws_open,
        linked_user: session.linked_user,
        linked_phone: session.linked_phone,
        profile_photo_url: profilePhotoUrl,
        connection_state: session.connection_state,
        session_ready: session.session_ready,
        zombie_session: session.zombie_session,
        capabilities: {
            post_restart: true,
            post_logout_session: true,
            get_qr: true,
            send_message: true,
        },
    });
});

app.get('/qr', bearerAuth, async (_req, res) => {
    try {
        const session = getSessionHealth();

        if (!lastQr) {
            return res.json({
                ok: true,
                connected: session.connected,
                session_ready: session.session_ready,
                linked_phone: session.linked_phone,
                has_qr: false,
                qr_png_base64: null,
                message: session.session_ready ? 'Sudah terhubung ke WhatsApp.' : 'Belum ada QR. Tunggu reconnect atau restart gateway.',
            });
        }

        const dataUrl = await QRCode.toDataURL(lastQr, {
            width: 280,
            margin: 2,
            errorCorrectionLevel: 'M',
        });

        return res.json({
            ok: true,
            connected: session.connected,
            session_ready: session.session_ready,
            has_qr: true,
            qr_png_base64: dataUrl.replace(/^data:image\/png;base64,/, ''),
        });
    } catch (error) {
        logger.error({ err: error }, 'QR encode failed');

        return res.status(500).json({
            ok: false,
            message: `Gagal membuat gambar QR: ${error?.message || 'unknown'}`,
        });
    }
});

app.post('/restart', bearerAuth, (_req, res) => {
    logger.info('Admin meminta restart gateway masjid; proses akan keluar.');
    res.json({
        ok: true,
        message: 'Proses gateway dihentikan. PM2/systemd akan menghidupkan ulang jika autorestart aktif.',
    });

    setTimeout(() => process.exit(0), 400);
});

app.post('/logout-session', bearerAuth, async (_req, res) => {
    try {
        if (sock) {
            try {
                await sock.logout();
            } catch (error) {
                logger.warn({ err: error }, 'sock.logout gagal atau session sudah tidak aktif; lanjut hapus session lokal.');
            }
        }

        await wipeSession();
        isConnected = false;
        lastQr = null;
        scheduleReconnect(1000);

        return res.json({
            ok: true,
            message: 'Session WhatsApp dihapus. Tunggu beberapa detik, tampilkan QR, lalu scan ulang.',
        });
    } catch (error) {
        logger.error({ err: error }, 'Gagal logout session WhatsApp.');

        return res.status(500).json({
            ok: false,
            message: `Gagal logout session: ${error?.message || 'unknown'}`,
        });
    }
});

app.post('/send-message', bearerAuth, async (req, res) => {
    try {
        const sessionCheck = assertSessionReady();

        if (!sessionCheck.ok) {
            return res.status(sessionCheck.status).json({
                ok: false,
                message: sessionCheck.message,
                session: sessionCheck.health ?? getSessionHealth(),
            });
        }

        const { phone, message, wait_delivery: waitDelivery } = req.body || {};
        const normalizedPhone = normalizePhone(phone);

        if (!normalizedPhone) {
            return res.status(422).json({
                ok: false,
                message: 'Field phone tidak valid.',
            });
        }

        if (!message || String(message).trim() === '') {
            return res.status(422).json({
                ok: false,
                message: 'Field message wajib diisi.',
            });
        }

        const jid = `${normalizedPhone}@s.whatsapp.net`;
        const waChecks = await sock.onWhatsApp(jid);
        const waCheck = Array.isArray(waChecks) ? waChecks[0] : null;

        if (!waCheck?.exists) {
            return res.status(422).json({
                ok: false,
                message: 'Nomor tidak terdaftar di WhatsApp.',
                data: { jid, normalized_phone: normalizedPhone },
            });
        }

        const sendJid = waCheck.jid || jid;
        const messageId = generateMessageIDV2(sock?.user?.id);
        let serverAck = null;
        let outboundSync = null;
        let sent = null;

        if (waitDelivery) {
            const serverAckWait = waitForMessageAck(messageId, MIN_SERVER_ACK_STATUS);
            const syncWait = waitForOutboundSync(messageId);

            try {
                await sock.sendPresenceUpdate('available', sendJid);
            } catch {
                // Non-fatal. Presence update can fail without blocking message send.
            }

            sent = await sock.sendMessage(sendJid, { text: String(message) }, { messageId });

            if (sent?.key?.id) {
                sentMessageCache.set(sent.key.id, sent);
            }

            [serverAck, outboundSync] = await Promise.all([serverAckWait, syncWait]);
        } else {
            sent = await sock.sendMessage(sendJid, { text: String(message) });
        }

        const session = getSessionHealth();
        const finalMessageId = sent?.key?.id ?? messageId;
        const serverAccepted =
            serverAck?.status === 'acked' || (typeof sent?.status === 'number' && sent.status >= MIN_SERVER_ACK_STATUS);
        const syncedToClient = outboundSync?.status === 'synced';
        const strongAck =
            serverAck?.status === 'acked' && typeof serverAck?.ack === 'number' && serverAck.ack >= MIN_STRONG_DELIVERY_ACK_STATUS;
        const deliveryConfirmed = !waitDelivery || syncedToClient || strongAck;

        const baseData = {
            jid: sendJid,
            normalized_phone: normalizedPhone,
            message_id: finalMessageId,
            timestamp: sent?.messageTimestamp || null,
            server_accepted: serverAccepted,
            server_ack: serverAck?.ack ?? null,
            delivery_status: serverAck?.status ?? null,
            outbound_sync: outboundSync?.status ?? null,
            delivery_confirmed: deliveryConfirmed,
            session_ready: session.session_ready,
            linked_phone: session.linked_phone,
            linked_user: session.linked_user,
        };

        if (waitDelivery && !serverAccepted) {
            return res.status(502).json({
                ok: false,
                message: 'WhatsApp server belum mengonfirmasi pesan. Coba kirim ulang atau reset session gateway jika berulang.',
                data: baseData,
            });
        }

        if (waitDelivery && serverAccepted && !deliveryConfirmed) {
            return res.json({
                ok: true,
                message: `Server WhatsApp menerima pesan, tetapi belum terbukti tersinkron ke HP gateway ${session.linked_phone || ''}. Cek chat di HP gateway atau coba kirim ulang.`,
                data: {
                    ...baseData,
                    sync_warning: true,
                    server_ack_only: true,
                },
            });
        }

        return res.json({
            ok: true,
            message: deliveryConfirmed ? 'Pesan terkirim dan tersinkron.' : 'Pesan diterima gateway masjid.',
            data: baseData,
        });
    } catch (error) {
        logger.error({ err: error }, 'send-message failed');

        return res.status(500).json({
            ok: false,
            message: `Gagal kirim pesan: ${error?.message || 'unknown error'}`,
        });
    }
});

app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Baileys gateway masjid HTTP server running.');
    void startSock();
});
