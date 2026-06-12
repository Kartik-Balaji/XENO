'use strict';

const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { canSendMessage } = require('../services/frequencyCap');
const axios = require('axios');
const { nanoid } = require('nanoid');

const CHANNEL_SERVICE_URL = 'http://localhost:3001/channel/send-batch';

// ---------------------------------------------------------------------------
// Helper: build segment query from segment_rules_json
// ---------------------------------------------------------------------------
/**
 * Builds a safe parameterized SQL query for customer matching.
 * Supported rule keys from craving_dna:
 *   - favorite_category (equals)
 *   - days_since_last_order (gte)
 *   - churn_risk_score (gte)
 *   - marketing_opt_in (any channel opt-in is true)
 *
 * Rules format: array of strings like:
 *   "favorite_category = spicy"
 *   "days_since_last_order >= 21"
 *   "churn_risk_score >= 0.5"
 *   "marketing_opt_in = true"
 *
 * @param {string[]} rules
 * @returns {{ whereClause: string, params: any[] }}
 */
function buildSegmentQuery(rules) {
  const conditions = [];
  const params = [];

  if (!Array.isArray(rules)) return { whereClause: '1=1', params: [] };

  for (const rule of rules) {
    const trimmed = rule.trim();

    // favorite_category = value
    const catMatch = trimmed.match(/^favorite_category\s*=\s*(.+)$/i);
    if (catMatch) {
      conditions.push('cd.favorite_category = ?');
      params.push(catMatch[1].trim());
      continue;
    }

    // days_since_last_order >= N
    const dslMatch = trimmed.match(/^days_since_last_order\s*>=\s*(\d+)$/i);
    if (dslMatch) {
      conditions.push('cd.days_since_last_order >= ?');
      params.push(parseInt(dslMatch[1], 10));
      continue;
    }

    // churn_risk_score >= N
    const churnMatch = trimmed.match(/^churn_risk_score\s*>=\s*([\d.]+)$/i);
    if (churnMatch) {
      conditions.push('cd.churn_risk_score >= ?');
      params.push(parseFloat(churnMatch[1]));
      continue;
    }

    // marketing_opt_in = true  (any channel opt-in)
    const optInMatch = trimmed.match(/^marketing_opt_in\s*=\s*true$/i);
    if (optInMatch) {
      conditions.push('(c.whatsapp_opt_in = 1 OR c.sms_opt_in = 1 OR c.email_opt_in = 1 OR c.rcs_opt_in = 1)');
      continue;
    }
  }

  const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  return { whereClause, params };
}

// ---------------------------------------------------------------------------
// Offer tier assignment based on churn_risk_score
// ---------------------------------------------------------------------------
function assignOfferTier(churn_risk_score) {
  if (churn_risk_score < 0.35) {
    return { offer_tier: 'loyal_points', offer_id: 'offer_loyal_points' };
  } else if (churn_risk_score < 0.70) {
    return { offer_tier: 'medium_risk_10', offer_id: 'offer_medium_10' };
  } else {
    return { offer_tier: 'high_risk_15', offer_id: 'offer_high_15' };
  }
}

// ---------------------------------------------------------------------------
// POST /api/campaigns/from-play
// ---------------------------------------------------------------------------
router.post('/from-play', async (req, res) => {
  try {
    const { play_id } = req.body;
    if (!play_id) return res.status(400).json({ error: 'Missing required field: play_id' });

    const db = await getDb();
    const play = await db.get('SELECT * FROM plays WHERE play_id = ?', [play_id]);
    if (!play) return res.status(404).json({ error: `Play not found: ${play_id}` });

    // Parse audience/rules
    let audience = {};
    let rules = [];
    try { audience = JSON.parse(play.audience_json || '{}'); } catch (_) {}
    rules = audience.rules || [];

    const campaign_id = `camp_${nanoid(8)}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO campaigns
         (campaign_id, play_id, campaign_name, objective, status,
          segment_rules_json, reasoning, recommended_send_time,
          predicted_metrics_json, created_at)
       VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?)`,
      [
        campaign_id,
        play_id,
        play.play_name,
        play.objective,
        JSON.stringify(rules),
        play.reasoning,
        play.recommended_send_time,
        play.predicted_json,
        now,
      ]
    );

    const campaign = await db.get('SELECT * FROM campaigns WHERE campaign_id = ?', [campaign_id]);
    return res.status(201).json(campaign);
  } catch (err) {
    console.error('POST /campaigns/from-play error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/campaigns  (list all)
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const campaigns = await db.all('SELECT * FROM campaigns ORDER BY created_at DESC');
    return res.json({ campaigns, total: campaigns.length });
  } catch (err) {
    console.error('GET /campaigns error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/campaigns/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const campaign = await db.get('SELECT * FROM campaigns WHERE campaign_id = ?', [req.params.id]);
    if (!campaign) return res.status(404).json({ error: `Campaign not found: ${req.params.id}` });
    return res.json(campaign);
  } catch (err) {
    console.error('GET /campaigns/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/campaigns/:id/launch
// ---------------------------------------------------------------------------
router.post('/:id/launch', async (req, res) => {
  const campaign_id = req.params.id;
  try {
    const db = await getDb();

    // 1. Fetch campaign and validate status
    const campaign = await db.get('SELECT * FROM campaigns WHERE campaign_id = ?', [campaign_id]);
    if (!campaign) return res.status(404).json({ error: `Campaign not found: ${campaign_id}` });
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return res.status(400).json({
        error: `Campaign cannot be launched in status: ${campaign.status}. Must be draft or scheduled.`,
      });
    }

    // 2. Parse segment rules
    let rules = [];
    try { rules = JSON.parse(campaign.segment_rules_json || '[]'); } catch (_) {}

    const { whereClause, params } = buildSegmentQuery(rules);

    // 3. Query matching customers (join customers + craving_dna)
    const customerQuery = `
      SELECT
        c.customer_id, c.first_name, c.last_name, c.phone, c.email,
        c.whatsapp_opt_in, c.sms_opt_in, c.email_opt_in, c.rcs_opt_in,
        cd.churn_risk_score, cd.preferred_channel, cd.favorite_category,
        cd.days_since_last_order
      FROM customers c
      INNER JOIN craving_dna cd ON cd.customer_id = c.customer_id
      WHERE ${whereClause}
    `;
    const matchedCustomers = await db.all(customerQuery, params);

    // 4. Frequency cap check + message creation
    const now = new Date().toISOString();
    let created_messages = 0;
    let skipped_frequency_cap = 0;
    const messageBatch = [];

    for (const customer of matchedCustomers) {
      const canSend = await canSendMessage(db, customer.customer_id);

      if (!canSend) {
        // Insert skipped event
        const skip_event_id = `evt_skip_${nanoid(12)}`;
        await db.run(
          `INSERT INTO communication_events
             (event_id, message_id, campaign_id, customer_id, channel, event_type,
              event_time, received_at, metadata_json, duplicate)
           VALUES (?, NULL, ?, ?, NULL, 'skipped', ?, ?, ?, 0)`,
          [
            skip_event_id,
            campaign_id,
            customer.customer_id,
            null,
            now,
            now,
            JSON.stringify({ reason: 'frequency_cap_exceeded' }),
          ]
        );
        skipped_frequency_cap++;
        continue;
      }

      // Assign offer tier
      const { offer_tier, offer_id } = assignOfferTier(customer.churn_risk_score || 0);

      // Assign channel based on preferred_channel from craving_dna
      let channel = customer.preferred_channel || 'sms';
      // Validate the customer actually opted in to that channel
      const channelOptInMap = {
        whatsapp: customer.whatsapp_opt_in,
        sms: customer.sms_opt_in,
        email: customer.email_opt_in,
        rcs: customer.rcs_opt_in,
      };
      if (!channelOptInMap[channel]) {
        // Fall back to any opted-in channel
        channel = Object.keys(channelOptInMap).find((ch) => channelOptInMap[ch]) || 'sms';
      }

      // Generate message_id
      const message_id = `msg_${nanoid(12)}`;

      await db.run(
        `INSERT INTO messages
           (message_id, campaign_id, customer_id, channel, offer_tier, offer_id,
            rendered_message, current_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'queued', ?)`,
        [
          message_id,
          campaign_id,
          customer.customer_id,
          channel,
          offer_tier,
          offer_id,
          `Hi ${customer.first_name}, ${offer_tier === 'loyal_points' ? 'earn 2x loyalty points' : offer_tier === 'medium_risk_10' ? 'get 10% off' : 'get 15% off'} on your next order at CraveStop!`,
          now,
        ]
      );

      messageBatch.push({
        message_id,
        campaign_id,
        customer_id: customer.customer_id,
        channel,
        offer_tier,
        offer_id,
        phone: customer.phone,
        email: customer.email,
      });

      created_messages++;
    }

    // 5. Update campaign status to 'sending'
    await db.run(
      `UPDATE campaigns SET status = 'sending', launched_at = ? WHERE campaign_id = ?`,
      [now, campaign_id]
    );

    // 6. Call channel service with required fields: batch_id, callback_url, messages with recipient
    let channel_service_batch_id = null;
    let channel_service_warning = null;
    try {
      const batch_id = `batch_${nanoid(10)}`;
      const callbackUrl = `http://localhost:3000/api/receipts`;

      // Map messageBatch to channel service format (recipient = phone or email)
      const channelMessages = messageBatch.map(m => ({
        message_id: m.message_id,
        customer_id: m.customer_id,
        channel: m.channel,
        recipient: m.phone || m.email || m.customer_id,
        body: `Hi, ${m.offer_tier === 'loyal_points' ? 'earn 2x loyalty points' : m.offer_tier === 'medium_risk_10' ? 'get 10% off' : 'get 15% off'} on your next order!`,
      }));

      const channelResponse = await axios.post(
        CHANNEL_SERVICE_URL,
        {
          batch_id,
          campaign_id,
          callback_url: callbackUrl,
          messages: channelMessages,
        },
        { timeout: 10000 }
      );
      channel_service_batch_id = channelResponse.data?.batch_id || batch_id;
    } catch (channelErr) {
      console.warn('Channel service unavailable:', channelErr.message);
      channel_service_warning = `Channel service unavailable: ${channelErr.message}. Messages are queued.`;
    }

    const responsePayload = {
      campaign_id,
      created_messages,
      skipped_frequency_cap,
      channel_service_batch_id,
    };
    if (channel_service_warning) {
      responsePayload.warning = channel_service_warning;
    }

    return res.json(responsePayload);
  } catch (err) {
    console.error(`POST /campaigns/${campaign_id}/launch error:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
