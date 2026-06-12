'use strict';

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');

/**
 * GET /api/customers
 * Returns paginated customer list with craving_dna joined.
 * Query params: page (default 1), limit (default 20), city, loyalty_tier
 */
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (req.query.city) {
      conditions.push('c.city = ?');
      params.push(req.query.city);
    }
    if (req.query.loyalty_tier) {
      conditions.push('c.loyalty_tier = ?');
      params.push(req.query.loyalty_tier);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countRow = await db.get(
      `SELECT COUNT(*) as total FROM customers c ${where}`,
      params
    );

    // Fetch paginated with craving_dna
    const customers = await db.all(
      `SELECT
         c.customer_id, c.first_name, c.last_name, c.phone, c.email,
         c.city, c.loyalty_tier, c.points_balance, c.app_user,
         c.whatsapp_opt_in, c.sms_opt_in, c.email_opt_in, c.rcs_opt_in,
         c.created_at,
         cd.favorite_category, cd.favorite_item, cd.usual_meal_period,
         cd.days_since_last_order, cd.churn_risk_score, cd.preferred_channel,
         cd.max_channel_engagement_score, cd.predicted_next_best_play
       FROM customers c
       LEFT JOIN craving_dna cd ON cd.customer_id = c.customer_id
       ${where}
       ORDER BY c.customer_id
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({
      customers,
      pagination: {
        page,
        limit,
        total: countRow.total,
        pages: Math.ceil(countRow.total / limit),
      },
    });
  } catch (err) {
    console.error('GET /customers error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/customers/:id
 * Fetch a single customer with full craving_dna and recent orders.
 */
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const customer = await db.get(
      `SELECT c.*, cd.* FROM customers c
       LEFT JOIN craving_dna cd ON cd.customer_id = c.customer_id
       WHERE c.customer_id = ?`,
      [req.params.id]
    );
    if (!customer) return res.status(404).json({ error: `Customer not found: ${req.params.id}` });

    const recentOrders = await db.all(
      `SELECT * FROM orders WHERE customer_id = ? ORDER BY order_time DESC LIMIT 10`,
      [req.params.id]
    );

    return res.json({ customer, recent_orders: recentOrders });
  } catch (err) {
    console.error('GET /customers/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
