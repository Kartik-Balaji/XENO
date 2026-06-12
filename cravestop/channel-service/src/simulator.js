/**
 * simulator.js
 * ------------
 * Async event simulation engine for the CraveStop channel service.
 *
 * Responsibilities:
 *  - Accept a batch of messages and channel configs
 *  - Use a seeded PRNG (mulberry32) for deterministic/repeatable simulation
 *  - Fire lifecycle events (sent → delivered → read → clicked → order_created)
 *  - Handle failures, retries, out-of-order injection (10%), and duplicate injection (5%)
 *  - POST each event callback to the CRM receipt endpoint with retry on network failure
 */

'use strict';

const axios = require('axios');
const { getChannelConfig } = require('./channelConfig');

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

/**
 * mulberry32 — fast, deterministic 32-bit PRNG.
 * Returns a closure that yields floats in [0, 1).
 */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Global PRNG instance — re-created each time simulateBatch() is called
// so that each batch starts from the configured seed.
let rand;

/**
 * Return a random integer in [min, max] (inclusive).
 */
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

// ─── HTTP Callback ────────────────────────────────────────────────────────────

const MAX_CALLBACK_RETRIES = 3;
const CALLBACK_RETRY_DELAY_MS = 5000;

/**
 * Build a canonical event payload for the CRM receipt endpoint.
 */
function buildEvent(msg, campaignId, eventType, metadata = {}) {
  const now = Date.now();
  return {
    event_id: `evt_${msg.message_id}_${eventType}_${now}`,
    message_id: msg.message_id,
    campaign_id: campaignId,
    customer_id: msg.customer_id,
    channel: msg.channel,
    event_type: eventType,
    event_time: new Date(now).toISOString(),
    metadata,
  };
}

/**
 * POST a single event to the CRM callback URL.
 * Retries up to MAX_CALLBACK_RETRIES times on network error, with a fixed delay.
 */
async function fireCallback(callbackUrl, payload, attempt = 1) {
  try {
    await axios.post(callbackUrl, payload, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (attempt < MAX_CALLBACK_RETRIES) {
      console.warn(
        `[simulator] Callback failed (attempt ${attempt}/${MAX_CALLBACK_RETRIES}) for event` +
          ` ${payload.event_id} → retrying in ${CALLBACK_RETRY_DELAY_MS}ms. Error: ${err.message}`
      );
      await sleep(CALLBACK_RETRY_DELAY_MS);
      return fireCallback(callbackUrl, payload, attempt + 1);
    } else {
      console.error(
        `[simulator] Callback permanently failed after ${MAX_CALLBACK_RETRIES} attempts` +
          ` for event ${payload.event_id}. Error: ${err.message}`
      );
    }
  }
}

/**
 * Fire an event callback, optionally also firing a duplicate 500 ms later.
 * Duplicate injection probability: 5% (rand() < 0.05).
 * The duplicate decision is sampled once per event.
 */
async function fireEvent(callbackUrl, payload, isDuplicate = false) {
  await fireCallback(callbackUrl, payload);

  // Duplicate injection — only for the original fire, not for re-fires
  if (!isDuplicate && rand() < 0.05) {
    const dupPayload = {
      ...payload,
      metadata: { ...payload.metadata, duplicate_injected: true },
    };
    await sleep(500);
    console.log(`[simulator] Firing duplicate for event ${payload.event_id}`);
    await fireCallback(callbackUrl, dupPayload);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Delay then fire an event. Returns a Promise so callers can schedule and
 * optionally await.
 */
function delayedEvent(ms, callbackUrl, payload) {
  return sleep(ms).then(() => fireEvent(callbackUrl, payload));
}

// ─── Per-message simulation ───────────────────────────────────────────────────

/**
 * Simulate the full lifecycle for a single message.
 * All timing decisions are made synchronously (using rand()) so that the PRNG
 * sequence is deterministic, but the actual network calls happen asynchronously
 * via setTimeout chains.
 */
async function simulateMessage(msg, campaignId, callbackUrl, cfg) {
  // ── Step 1: sent event (tiny initial delay 100–500ms) ──────────────────────
  const sentDelay = randInt(100, 500);

  // ── Step 2: failure decision ───────────────────────────────────────────────
  const failed = rand() < cfg.failure_rate;

  // ── Retry decisions (sample now to keep PRNG sequence stable) ─────────────
  let willRetry = false;
  let retryWillSucceed = false;
  if (failed && cfg.retry_on_fail) {
    willRetry = rand() < cfg.retry_rate;
    if (willRetry) {
      retryWillSucceed = rand() < cfg.retry_success_rate;
    }
  }

  // ── Delivery + post-delivery decisions ────────────────────────────────────
  const deliveryDelay = randInt(cfg.delivery_delay_ms.min, cfg.delivery_delay_ms.max);

  const willRead = cfg.read_rate > 0 && rand() < cfg.read_rate;
  const readDelay = willRead
    ? randInt(cfg.read_delay_ms.min, cfg.read_delay_ms.max)
    : 0;

  // click_rate is relative to delivered (not read) for all channels, but
  // click fires AFTER read (or delivery for SMS). Sample the decision now.
  const willClick = rand() < cfg.click_rate;
  const clickDelay = willClick
    ? randInt(cfg.click_delay_ms.min, cfg.click_delay_ms.max)
    : 0;

  const willOrder = willClick && rand() < cfg.order_after_click;

  // ── Out-of-order injection decision (10%) ─────────────────────────────────
  const injectOutOfOrder = rand() < 0.10;

  // ── Now build and schedule all events ─────────────────────────────────────
  const promises = [];

  // Helper to schedule an event at an absolute offset from "now"
  let cursor = 0; // tracks cumulative wall-clock offset in ms

  function schedule(eventType, offset, extra = {}) {
    const payload = buildEvent(msg, campaignId, eventType, extra);
    promises.push(delayedEvent(offset, callbackUrl, payload));
  }

  // sent
  schedule('sent', sentDelay);
  cursor = sentDelay;

  if (failed) {
    // failed
    cursor += 200; // tiny gap after sent
    schedule('failed', cursor);

    if (willRetry) {
      // retry_scheduled
      const scheduleOffset = cursor + 50;
      schedule('retry_scheduled', scheduleOffset);

      // retrying (after retry_delay_ms)
      const retryingOffset = cursor + cfg.retry_delay_ms;
      schedule('retrying', retryingOffset);
      cursor = retryingOffset;

      if (retryWillSucceed) {
        // sent_after_retry → then continue as delivered
        cursor += 150;
        schedule('sent_after_retry', cursor);
        // Fall through to delivery below
      } else {
        // permanent failure — second failed event, stop
        cursor += 200;
        schedule('failed', cursor);
        await Promise.all(promises);
        return;
      }
    } else {
      // No retry — permanent failure
      await Promise.all(promises);
      return;
    }
  }

  // ── Delivered ─────────────────────────────────────────────────────────────
  const deliveredOffset = cursor + deliveryDelay;

  // ── Out-of-order: swap delivered and read ─────────────────────────────────
  if (injectOutOfOrder && willRead) {
    // Fire read BEFORE delivered (swap)
    const readOffset = deliveredOffset - Math.floor(readDelay / 2); // arrive before delivered
    const oooMeta = { out_of_order_injected: true };

    schedule('read', Math.max(cursor + 100, readOffset), oooMeta);
    schedule('delivered', deliveredOffset, oooMeta);
    cursor = deliveredOffset;
  } else {
    schedule('delivered', deliveredOffset);
    cursor = deliveredOffset;

    // read (normal order)
    if (willRead) {
      cursor += readDelay;
      schedule('read', cursor);
    }
  }

  // ── Clicked ───────────────────────────────────────────────────────────────
  if (willClick) {
    // For SMS, click fires after delivery (no read). For others, after read (if any).
    const clickBase = cursor; // cursor is already past read (or delivery for SMS)
    const clickOffset = clickBase + clickDelay;
    schedule('clicked', clickOffset);

    // ── order_created ──────────────────────────────────────────────────────
    if (willOrder) {
      schedule('order_created', clickOffset + randInt(500, 2000));
    }
  }

  await Promise.all(promises);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * simulateBatch
 * -------------
 * Entry point called by the Express route. Runs asynchronously — the route
 * returns immediately after calling this.
 *
 * @param {object} batchPayload  The full POST body from /channel/send-batch
 * @param {number} seed          PRNG seed (defaults to CHANNEL_SIM_SEED env var or 42)
 */
async function simulateBatch(batchPayload, seed) {
  const { batch_id, campaign_id, callback_url, messages } = batchPayload;

  // Re-initialise the global PRNG for this batch
  rand = mulberry32(seed);

  console.log(
    `[simulator] Starting batch "${batch_id}" | campaign "${campaign_id}"` +
      ` | ${messages.length} messages | seed=${seed} | callback → ${callback_url}`
  );

  // Fire all message simulations concurrently (they each manage their own
  // internal sequential flow via async/await + setTimeout chains).
  const simulations = messages.map((msg) => {
    let cfg;
    try {
      cfg = getChannelConfig(msg.channel);
    } catch (e) {
      console.error(`[simulator] Skipping message ${msg.message_id}: ${e.message}`);
      return Promise.resolve();
    }
    return simulateMessage(msg, campaign_id, callback_url, cfg).catch((err) => {
      console.error(
        `[simulator] Unhandled error for message ${msg.message_id}: ${err.message}`
      );
    });
  });

  try {
    await Promise.all(simulations);
    console.log(`[simulator] Batch "${batch_id}" simulation complete.`);
  } catch (err) {
    console.error(`[simulator] Batch "${batch_id}" encountered a top-level error: ${err.message}`);
  }
}

module.exports = { simulateBatch };
