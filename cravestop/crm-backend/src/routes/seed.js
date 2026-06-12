'use strict';

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const path = require('path');
const { execFile } = require('child_process');

/**
 * POST /api/seed
 * Triggers the seed script programmatically.
 */
router.post('/', async (req, res) => {
  try {
    const seedScript = path.resolve(__dirname, '..', 'db', 'seed.js');
    execFile('node', [seedScript], { timeout: 120000 }, async (err, stdout, stderr) => {
      if (err) {
        console.error('Seed error:', err.message, stderr);
        return res.status(500).json({ error: 'Seed failed', details: err.message });
      }

      // Return counts from all major tables
      try {
        const db = await getDb();
        const [customers, orders, stores, campaigns, events] = await Promise.all([
          db.get('SELECT COUNT(*) as cnt FROM customers'),
          db.get('SELECT COUNT(*) as cnt FROM orders'),
          db.get('SELECT COUNT(*) as cnt FROM stores'),
          db.get('SELECT COUNT(*) as cnt FROM campaigns'),
          db.get('SELECT COUNT(*) as cnt FROM communication_events'),
        ]);
        return res.json({
          customers: customers.cnt,
          orders: orders.cnt,
          stores: stores.cnt,
          campaigns: campaigns.cnt,
          events: events.cnt,
        });
      } catch (dbErr) {
        return res.status(500).json({ error: 'Seed ran but count query failed', details: dbErr.message });
      }
    });
  } catch (err) {
    console.error('Seed route error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
