'use strict';

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { attributeOrder } = require('../services/attribution');
const { nanoid } = require('nanoid');

/**
 * POST /api/orders
 * Creates an order record. Runs attribution check (last click 24h wins).
 * Input: { customer_id, store_id, order_value, items: [...] }
 */
router.post('/', async (req, res) => {
  try {
    const { customer_id, store_id, order_value, items = [] } = req.body;

    if (!customer_id || !store_id || order_value === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: customer_id, store_id, order_value',
      });
    }

    const db = await getDb();

    // Validate customer exists
    const customer = await db.get('SELECT customer_id FROM customers WHERE customer_id = ?', [customer_id]);
    if (!customer) return res.status(404).json({ error: `Customer not found: ${customer_id}` });

    const order_id = `ord_${nanoid(12)}`;
    const order_time = new Date().toISOString();

    // Attribution check — last click within 24h
    const attributed_campaign_id = await attributeOrder(db, customer_id, order_time);

    // Insert order
    await db.run(
      `INSERT INTO orders
         (order_id, customer_id, store_id, order_time, order_channel, fulfillment_type,
          meal_period, order_value, discount_used, attributed_campaign_id, attribution_source)
       VALUES (?, ?, ?, ?, 'api', 'delivery', 'lunch', ?, 0, ?, ?)`,
      [
        order_id, customer_id, store_id, order_time, order_value,
        attributed_campaign_id,
        attributed_campaign_id ? 'last_click_24h' : null,
      ]
    );

    // Insert order items
    for (const item of items) {
      const order_item_id = `oi_${nanoid(10)}`;
      await db.run(
        `INSERT INTO order_items
           (order_item_id, order_id, sku, item_name, category, quantity, unit_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order_item_id, order_id,
          item.sku || null, item.item_name || null,
          item.category || null, item.quantity || 1,
          item.unit_price || 0,
        ]
      );
    }

    const order = await db.get('SELECT * FROM orders WHERE order_id = ?', [order_id]);
    return res.status(201).json({
      order,
      attribution: attributed_campaign_id
        ? { campaign_id: attributed_campaign_id, source: 'last_click_24h' }
        : null,
    });
  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
