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
    });

    sock.ev.on('creds.update', saveCreds);
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

        const { phone, message } = req.body || {};
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

        const sent = await sock.sendMessage(waCheck.jid || jid, { text: String(message) });
        const session = getSessionHealth();

        return res.json({
            ok: true,
            message: 'Pesan diterima gateway masjid.',
            data: {
                jid: waCheck.jid || jid,
                normalized_phone: normalizedPhone,
                message_id: sent?.key?.id ?? null,
                timestamp: sent?.messageTimestamp || null,
                session_ready: session.session_ready,
                linked_phone: session.linked_phone,
                linked_user: session.linked_user,
            },
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
