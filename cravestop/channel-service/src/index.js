/**
 * index.js
 * --------
 * Main Express server for the CraveStop Channel Simulation Service.
 *
 * Endpoints:
 *   GET  /health              — liveness probe
 *   POST /channel/send-batch  — accept a message batch, simulate asynchronously
 *
 * Port: 3001 (or PORT env var)
 */

'use strict';

const express = require('express');
const cors = require('cors');
const { simulateBatch } = require('./simulator');

// ─── Configuration ────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
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
 *
 * Request body:
 * {
 *   "batch_id":     "batch_001",
 *   "campaign_id":  "camp_001",
 *   "callback_url": "http://localhost:3000/api/receipts",
 *   "messages": [
 *     {
 *       "message_id":  "msg_001",
 *       "customer_id": "cust_001",
 *       "channel":     "whatsapp",   // whatsapp | sms | email | rcs
 *       "recipient":   "+919810000001",
 *       "body":        "Rhea, your Volcano Burrito misses you..."
 *     }
 *   ]
 * }
 *
 * Response (immediate — does NOT wait for simulation to finish):
 * {
 *   "accepted":           true,
 *   "batch_id":           "batch_001",
 *   "scheduled_messages": 1
 * }
 *
 * After responding, the service asynchronously fires per-event callbacks to
 * callback_url with the shape described in the channel service spec.
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
  // Use the seed from env var; falls back to 42
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

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║       CraveStop Channel Simulation Service       ║
║  Listening on http://localhost:${PORT}              ║
║  Seed: ${CHANNEL_SIM_SEED} (set CHANNEL_SIM_SEED to override)  ║
╚══════════════════════════════════════════════════╝
  `);
});

module.exports = app; // exported for testing
