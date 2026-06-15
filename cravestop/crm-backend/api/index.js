'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { getDb } = require('../src/db/db');

// ── Route imports ──────────────────────────────────────────────────────────
const seedRouter       = require('../src/routes/seed');
const playsRouter      = require('../src/routes/plays');
const campaignsRouter  = require('../src/routes/campaigns');
const receiptsRouter   = require('../src/routes/receipts');
const eventsRouter     = require('../src/routes/events');
const analyticsRouter  = require('../src/routes/analytics');
const ordersRouter     = require('../src/routes/orders');
const customersRouter  = require('../src/routes/customers');

const app = express();

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
const campaignSubRouter = express.Router({ mergeParams: true });
campaignSubRouter.use('/events',    eventsRouter);
campaignSubRouter.use('/analytics', analyticsRouter);
app.use('/api/campaigns/:id', campaignSubRouter);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Export for Vercel
module.exports = app;
