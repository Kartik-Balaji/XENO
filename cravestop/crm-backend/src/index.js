'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { getDb } = require('./db/db');

// ── Route imports ──────────────────────────────────────────────────────────
const seedRouter       = require('./routes/seed');
const playsRouter      = require('./routes/plays');
const campaignsRouter  = require('./routes/campaigns');
const receiptsRouter   = require('./routes/receipts');
const eventsRouter     = require('./routes/events');
const analyticsRouter  = require('./routes/analytics');
const ordersRouter     = require('./routes/orders');
const customersRouter  = require('./routes/customers');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3002',
    'http://localhost:3000',
    /\.vercel\.app$/,          // all Vercel preview + production URLs
    /cravestop\.vercel\.app$/, // explicit production domain
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get("SELECT COUNT(*) as customers FROM customers");
    return res.json({
      status: 'ok',
      service: 'CraveStop CRM Backend',
      port: PORT,
      db: 'connected',
      customers_in_db: row.customers,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/seed',       seedRouter);
app.use('/api/plays',      playsRouter);
app.use('/api/campaigns',  campaignsRouter);
app.use('/api/receipts',   receiptsRouter);
app.use('/api/orders',     ordersRouter);
app.use('/api/customers',  customersRouter);

// Campaign sub-routes: events and analytics need :id param threaded through.
// We mount them via a mini sub-router with mergeParams=true so req.params.id
// is accessible inside eventsRouter and analyticsRouter.
const campaignSubRouter = express.Router({ mergeParams: true });
campaignSubRouter.use('/events',    eventsRouter);
campaignSubRouter.use('/analytics', analyticsRouter);
app.use('/api/campaigns/:id', campaignSubRouter);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log(`║  CraveStop CRM Backend running on port ${PORT}        ║`);
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  GET    /health                                      ║');
  console.log('║  POST   /api/seed                                    ║');
  console.log('║  POST   /api/plays/generate                          ║');
  console.log('║  GET    /api/plays/:play_id                          ║');
  console.log('║  POST   /api/campaigns/from-play                     ║');
  console.log('║  GET    /api/campaigns                               ║');
  console.log('║  GET    /api/campaigns/:id                           ║');
  console.log('║  POST   /api/campaigns/:id/launch                    ║');
  console.log('║  POST   /api/receipts                                ║');
  console.log('║  GET    /api/campaigns/:id/events  (+ SSE)           ║');
  console.log('║  GET    /api/campaigns/:id/analytics                 ║');
  console.log('║  POST   /api/orders                                  ║');
  console.log('║  GET    /api/customers                               ║');
  console.log('║  GET    /api/customers/:id                           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
