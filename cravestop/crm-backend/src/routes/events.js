'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const { getDb } = require('../db/db');

/**
 * GET /api/campaigns/:id/events
 *
 * Returns all communication_events for a campaign, ordered by received_at DESC.
 * If Accept: text/event-stream → SSE mode (polls DB every 1s and streams new events).
 */
router.get('/', async (req, res) => {
  const campaign_id = req.params.id;

  // --- SSE mode ---
  if (req.headers.accept === 'text/event-stream') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering if applicable
    res.flushHeaders();

    let lastSeenId = null;
    let closed = false;

    // Send initial snapshot
    try {
      const db = await getDb();
      const initialEvents = await db.all(
        `SELECT * FROM communication_events
         WHERE campaign_id = ?
         ORDER BY received_at DESC`,
        [campaign_id]
      );

      for (const evt of initialEvents.reverse()) {
        res.write(`data: ${JSON.stringify(evt)}\n\n`);
        lastSeenId = evt.event_id;
      }

      // Poll for new events every 1 second
      const intervalId = setInterval(async () => {
        if (closed) {
          clearInterval(intervalId);
          return;
        }
        try {
          let newEvents;
          if (lastSeenId) {
            newEvents = await db.all(
              `SELECT * FROM communication_events
               WHERE campaign_id = ?
                 AND received_at > (SELECT received_at FROM communication_events WHERE event_id = ?)
               ORDER BY received_at ASC`,
              [campaign_id, lastSeenId]
            );
          } else {
            newEvents = await db.all(
              `SELECT * FROM communication_events
               WHERE campaign_id = ?
               ORDER BY received_at ASC`,
              [campaign_id]
            );
          }
          for (const evt of newEvents) {
            res.write(`data: ${JSON.stringify(evt)}\n\n`);
            lastSeenId = evt.event_id;
          }
        } catch (pollErr) {
          console.error('SSE poll error:', pollErr.message);
        }
      }, 1000);

      req.on('close', () => {
        closed = true;
        clearInterval(intervalId);
        res.end();
      });
    } catch (err) {
      console.error('SSE setup error:', err);
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
    return;
  }

  // --- Regular JSON mode ---
  try {
    const db = await getDb();
    const events = await db.all(
      `SELECT * FROM communication_events
       WHERE campaign_id = ?
       ORDER BY received_at DESC`,
      [campaign_id]
    );
    return res.json({ campaign_id, events, total: events.length });
  } catch (err) {
    console.error('GET /campaigns/:id/events error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
