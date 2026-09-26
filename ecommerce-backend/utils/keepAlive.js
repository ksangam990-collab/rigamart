const https = require('https');
const http = require('http');

/**
 * Self-ping Keep-Alive utility to prevent Render free-tier instance spindown.
 * Triggers automatically if RENDER_EXTERNAL_URL or BACKEND_URL is defined.
 */
const initKeepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
  if (!url) {
    return;
  }

  const pingUrl = `${url.replace(/\/$/, '')}/api/health`;
  const intervalMs = 14 * 60 * 1000; // 14 minutes (Render sleeps at 15 minutes)

  console.log(`📡 Keep-Alive heartbeat initialized for: ${pingUrl} (every 14 mins)`);

  setInterval(() => {
    const client = pingUrl.startsWith('https') ? https : http;
    client.get(pingUrl, (res) => {
      console.log(`💓 [Heartbeat] Keep-alive ping sent to ${pingUrl} - Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`⚠️ [Heartbeat Error] Failed to ping ${pingUrl}:`, err.message);
    });
  }, intervalMs);
};

module.exports = { initKeepAlive };
