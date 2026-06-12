'use strict';

/**
 * Attribution Service — Last-click 24h attribution window.
 * If a customer clicked a campaign link within 24h before an order,
 * that campaign is credited with the order.
 */

/**
 * Returns the attributed campaign_id or null.
 * @param {object} db - sqlite db instance (async)
 * @param {string} customer_id
 * @param {string} order_time - ISO 8601 string
 * @returns {Promise<string|null>}
 */
async function attributeOrder(db, customer_id, order_time) {
  const cutoff = new Date(new Date(order_time).getTime() - 24 * 60 * 60 * 1000).toISOString();
  const click = await db.get(
    `SELECT campaign_id FROM communication_events
     WHERE customer_id = ?
       AND event_type = 'clicked'
       AND event_time >= ?
       AND event_time <= ?
       AND duplicate = 0
     ORDER BY event_time DESC
     LIMIT 1`,
    [customer_id, cutoff, order_time]
  );
  return click ? click.campaign_id : null;
}

module.exports = { attributeOrder };
