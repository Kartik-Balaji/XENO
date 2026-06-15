/**
 * Vercel Serverless Handler
 * --------
 * Main handler for the CraveStop Channel Simulation Service on Vercel.
 */

'use strict';

const express = require('express');
const cors = require('cors');
const { simulateBatch } = require('../src/simulator');

// ─── Configuration ────────────────────────────────────────────────────────────

const CHANNEL_SIM_SEED = parseInt(process.env.CHANNEL_SIM_SEED || '42', 10);

// ─── App setup ────────────────────────────────────────────────────────────────

const app = express();

// CORS — allow all origins (adjust in production)
app.use(cors());

// JSON body parsing (max 10 MB to handle large batches)
app.use(express.json({ limit: '10mb' }));

// ─── Request logger ───────────────────────────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}` +
        ` → ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /health
 * Liveness / readiness probe.
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'channel-service' });
});

/**
 * POST /channel/send-batch
 */
app.post('/channel/send-batch', (req, res) => {
  const body = req.body;

  // ── Validation ──────────────────────────────────────────────────────────────
  const missing = ['batch_id', 'campaign_id', 'callback_url', 'messages'].filter(
    (k) => body[k] === undefined || body[k] === null
  );
  if (missing.length > 0) {
    return res.status(400).json({
      accepted: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({
      accepted: false,
      error: 'messages must be a non-empty array',
    });
  }

  // Validate each message has the required fields
  const requiredMsgFields = ['message_id', 'customer_id', 'channel', 'recipient'];
  for (const [i, msg] of body.messages.entries()) {
    const msgMissing = requiredMsgFields.filter((k) => !msg[k]);
    if (msgMissing.length > 0) {
      return res.status(400).json({
        accepted: false,
        error: `messages[${i}] missing fields: ${msgMissing.join(', ')}`,
      });
    }
  }

  // ── Respond immediately ─────────────────────────────────────────────────────
  res.status(202).json({
    accepted: true,
    batch_id: body.batch_id,
    scheduled_messages: body.messages.length,
  });

  // ── Fire simulation asynchronously (do NOT await) ───────────────────────────
  setImmediate(() => {
    simulateBatch(body, CHANNEL_SIM_SEED).catch((err) => {
      console.error(`[server] simulateBatch threw unexpectedly: ${err.message}`);
    });
  });
});

// ─── 404 catch-all ───────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel
const handler = (req, res) => app(req, res);

module.exports = handler;
module.exports.default = handler;
