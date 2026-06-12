'use strict';

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { STATUS_PRIORITY } = require('../services/statusPriority');
const { attributeOrder } = require('../services/attribution');

/**
 * POST /api/receipts
 *
 * Idempotency-critical endpoint. Called by the channel service to report
 * delivery/engagement events. Two-layer duplicate detection:
 *   1. event_id uniqueness (PRIMARY)
 *   2. (message_id, event_type, event_time) composite uniqueness (FALLBACK)
 *
 * Only non-duplicate events update message current_status (priority-based, no downgrade).
 */
router.post('/', async (req, res) => {
  try {
    const {
      event_id,
      message_id,
      campaign_id,
      customer_id,
      channel,
      event_type,
      event_time,
      metadata = {},
    } = req.body;

    // --- Input validation ---
    if (!event_id || !message_id || !campaign_id || !customer_id || !event_type || !event_time) {
      return res.status(400).json({
        error: 'Missing required fields: event_id, message_id, campaign_id, customer_id, event_type, event_time',
      });
    }

    const db = await getDb();
    const received_at = new Date().toISOString();

    // -----------------------------------------------------------------------
    // IDEMPOTENCY CHECK 1: event_id uniqueness (PRIMARY)
    // -----------------------------------------------------------------------
    const existingById = await db.get(
      'SELECT event_id FROM communication_events WHERE event_id = ?',
      [event_id]
    );
    if (existingById) {
      return res.json({
        accepted: true,
        duplicate: true,
        message: 'Event already processed; counters unchanged.',
      });
    }

    // -----------------------------------------------------------------------
    // IDEMPOTENCY CHECK 2: (message_id, event_type, event_time) composite
    // -----------------------------------------------------------------------
    const existingByComposite = await db.get(
      `SELECT event_id FROM communication_events
       WHERE message_id = ? AND event_type = ? AND event_time = ? AND duplicate = 0`,
      [message_id, event_type, event_time]
    );
    if (existingByComposite) {
      // Insert with duplicate=1 so we have a trace, but counters unchanged
      await db.run(
        `INSERT INTO communication_events
           (event_id, message_id, campaign_id, customer_id, channel, event_type,
            event_time, received_at, metadata_json, duplicate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          event_id, message_id, campaign_id, customer_id,
          channel || null, event_type, event_time, received_at,
          JSON.stringify(metadata),
        ]
      );
      return res.json({
        accepted: true,
        duplicate: true,
        message: 'Event already processed; counters unchanged.',
      });
    }

    // -----------------------------------------------------------------------
    // NOT DUPLICATE — insert fresh event
    // -----------------------------------------------------------------------
    await db.run(
      `INSERT INTO communication_events
         (event_id, message_id, campaign_id, customer_id, channel, event_type,
          event_time, received_at, metadata_json, duplicate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        event_id, message_id, campaign_id, customer_id,
        channel || null, event_type, event_time, received_at,
        JSON.stringify(metadata),
      ]
    );

    // -----------------------------------------------------------------------
    // UPDATE message current_status (priority-based — no downgrade)
    // -----------------------------------------------------------------------
    const message = await db.get(
      'SELECT current_status FROM messages WHERE message_id = ?',
      [message_id]
    );

    let new_status = event_type; // event_type maps to status
    if (message) {
      const currentPriority = STATUS_PRIORITY[message.current_status] ?? -1;
      const incomingPriority = STATUS_PRIORITY[event_type] ?? -1;

      if (incomingPriority > currentPriority) {
        await db.run(
          'UPDATE messages SET current_status = ? WHERE message_id = ?',
          [event_type, message_id]
        );
        new_status = event_type;
      } else {
        new_status = message.current_status;
      }
    }

    // -----------------------------------------------------------------------
    // ATTRIBUTION — if order_created, check 24h click window
    // -----------------------------------------------------------------------
    if (event_type === 'order_created') {
      const attributed_campaign_id = await attributeOrder(db, customer_id, event_time);
      if (attributed_campaign_id) {
        // Update any orders for this customer that are near this event_time
        await db.run(
          `UPDATE orders
           SET attributed_campaign_id = ?, attribution_source = 'last_click_24h'
           WHERE customer_id = ?
             AND attributed_campaign_id IS NULL
             AND ABS(julianday(order_time) - julianday(?)) < 1`,
          [attributed_campaign_id, customer_id, event_time]
        );
      }
    }

    return res.json({
      accepted: true,
      duplicate: false,
      current_status: new_status,
    });
  } catch (err) {
    console.error('POST /receipts error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
