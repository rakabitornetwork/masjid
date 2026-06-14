const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

module.exports = {
    apps: [
        {
            name: 'masjid-baileys-gateway',
            script: 'src/index.js',
            cwd: __dirname,
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
            env: {
                NODE_ENV: 'production',
                PORT: process.env.PORT || '3002',
                BAILEYS_TOKEN: process.env.BAILEYS_TOKEN || '',
                BAILEYS_SESSION_DIR: process.env.BAILEYS_SESSION_DIR || '.baileys_masjid_auth',
                BAILEYS_DEVICE_NAME: process.env.BAILEYS_DEVICE_NAME || 'Masjid Gateway',
                BAILEYS_BROWSER_NAME: process.env.BAILEYS_BROWSER_NAME || 'Chrome',
                BAILEYS_DEVICE_OS: process.env.BAILEYS_DEVICE_OS || 'Aplikasi Manajemen Masjid',
                BAILEYS_BROWSER_VERSION: process.env.BAILEYS_BROWSER_VERSION || '120.0.6099.129',
                BAILEYS_DELIVERY_ACK_TIMEOUT_MS: process.env.BAILEYS_DELIVERY_ACK_TIMEOUT_MS || '15000',
            },
        },
    ],
};
