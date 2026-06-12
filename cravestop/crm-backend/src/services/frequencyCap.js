'use strict';

/**
 * Frequency Cap Service
 * Max 2 marketing messages per customer in rolling 7 days across all campaigns.
 * Only 'sent' events with duplicate=0 are counted.
 */

/**
 * Returns true if the customer can receive a message (under cap).
 * Returns false if capped.
 * @param {object} db - sqlite db instance (async)
 * @param {string} customer_id
 * @returns {Promise<boolean>}
 */
async function canSendMessage(db, customer_id) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const row = await db.get(
    `SELECT COUNT(*) as cnt FROM communication_events
     WHERE customer_id = ? AND event_type = 'sent'
     AND event_time >= ?
     AND duplicate = 0`,
    [customer_id, sevenDaysAgo]
  );
  return row.cnt < 2;
}

module.exports = { canSendMessage };
