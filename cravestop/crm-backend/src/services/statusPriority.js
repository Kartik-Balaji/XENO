'use strict';

/**
 * Status priority map — shared constant for receipt idempotency and status upgrades.
 * Higher number = higher priority. We never downgrade a message status.
 */
const STATUS_PRIORITY = {
  queued: 0,
  sent: 1,
  failed: 2,
  retry_scheduled: 2,
  retrying: 2,
  sent_after_retry: 3,
  delivered: 4,
  read: 5,
  clicked: 6,
  order_created: 7,
};

module.exports = { STATUS_PRIORITY };
