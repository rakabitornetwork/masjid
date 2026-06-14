# Baileys Gateway Masjid

Gateway WhatsApp berbasis Baileys untuk Aplikasi Manajemen Masjid. Service ini terpisah dari gateway project lain dan memakai port default `3002`.

## Install

```bash
cd baileys-gateway
npm install
cp .env.example .env
```

Ubah `.env`:

```env
PORT=3002
BAILEYS_TOKEN=token-rahasia-yang-berbeda
BAILEYS_SESSION_DIR=.baileys_masjid_auth
BAILEYS_DEVICE_NAME=Masjid Gateway
```

## Jalankan

```bash
npm run start
```

Saat pertama kali berjalan, scan QR dari WhatsApp nomor masjid melalui menu **Perangkat tertaut**.

## PM2

```bash
npm run pm2:start
pm2 save
```

Perintah harian:

```bash
npm run pm2:logs
npm run pm2:restart
npm run pm2:stop
```

## Endpoint

- `GET /health`
- `GET /qr` dengan Bearer token
- `POST /restart` dengan Bearer token
- `POST /logout-session` dengan Bearer token
- `POST /send-message` dengan Bearer token

Contoh:

```bash
curl -X POST http://127.0.0.1:3002/send-message \
  -H "Authorization: Bearer token-rahasia-yang-berbeda" \
  -H "Content-Type: application/json" \
  -d '{"phone":"6281234567890","message":"Assalamu alaikum dari Masjid"}'
```
