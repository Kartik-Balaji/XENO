'use strict';

/**
 * Analytics Aggregator — computes Performance Kitchen metrics for a campaign.
 * Also generates a deterministic AI insight based on segment performance.
 */

/**
 * Aggregate campaign analytics from the DB.
 * @param {object} db - sqlite db instance (async)
 * @param {string} campaign_id
 * @returns {Promise<object>}
 */
async function aggregateCampaignAnalytics(db, campaign_id) {
  // Fetch the campaign record
  const campaign = await db.get(
    `SELECT * FROM campaigns WHERE campaign_id = ?`,
    [campaign_id]
  );
  if (!campaign) return null;

  // --- Core message stats from messages table ---
  const messages = await db.all(
    `SELECT m.message_id, m.customer_id, m.channel, m.offer_tier, m.current_status
     FROM messages m
     WHERE m.campaign_id = ?`,
    [campaign_id]
  );

  // --- Count events by type from communication_events (non-duplicate only) ---
  const eventRows = await db.all(
    `SELECT event_type, channel, COUNT(*) as cnt
     FROM communication_events
     WHERE campaign_id = ? AND duplicate = 0
     GROUP BY event_type, channel`,
    [campaign_id]
  );

  // Build event-type totals
  const eventTotals = {};
  const channelEvents = {};
  for (const row of eventRows) {
    eventTotals[row.event_type] = (eventTotals[row.event_type] || 0) + row.cnt;
    if (!channelEvents[row.channel]) channelEvents[row.channel] = {};
    channelEvents[row.channel][row.event_type] = (channelEvents[row.channel][row.event_type] || 0) + row.cnt;
  }

  // Frequency-cap skips
  const skipRow = await db.get(
    `SELECT COUNT(*) as cnt FROM communication_events
     WHERE campaign_id = ? AND event_type = 'skipped'
     AND metadata_json LIKE '%frequency_cap_exceeded%'
     AND duplicate = 0`,
    [campaign_id]
  );
  const skipped_frequency_cap = skipRow ? skipRow.cnt : 0;

  // Attributed orders (order_created events with duplicate=0)
  const attrOrders = await db.all(
    `SELECT ce.customer_id, o.order_value
     FROM communication_events ce
     LEFT JOIN orders o ON o.customer_id = ce.customer_id AND o.attributed_campaign_id = ce.campaign_id
     WHERE ce.campaign_id = ? AND ce.event_type = 'order_created' AND ce.duplicate = 0`,
    [campaign_id]
  );
  const attributed_orders = attrOrders.length;
  const attributed_revenue = attrOrders.reduce((sum, r) => sum + (r.order_value || 0), 0);

  // Core metrics
  const sent = eventTotals['sent'] || 0;
  const delivered = eventTotals['delivered'] || 0;
  const failed = eventTotals['failed'] || 0;
  const read_or_opened = eventTotals['read'] || 0;
  const clicked = eventTotals['clicked'] || 0;

  const delivery_rate = sent > 0 ? parseFloat((delivered / sent * 100).toFixed(2)) : 0;
  const click_rate = delivered > 0 ? parseFloat((clicked / delivered * 100).toFixed(2)) : 0;
  const conversion_rate = clicked > 0 ? parseFloat((attributed_orders / clicked * 100).toFixed(2)) : 0;

  // --- By channel breakdown ---
  const by_channel = {};
  for (const [channel, evts] of Object.entries(channelEvents)) {
    const ch_sent = evts['sent'] || 0;
    const ch_delivered = evts['delivered'] || 0;
    const ch_clicked = evts['clicked'] || 0;
    by_channel[channel] = {
      sent: ch_sent,
      delivered: ch_delivered,
      clicked: ch_clicked,
      delivery_rate: ch_sent > 0 ? parseFloat((ch_delivered / ch_sent * 100).toFixed(2)) : 0,
      click_rate: ch_delivered > 0 ? parseFloat((ch_clicked / ch_delivered * 100).toFixed(2)) : 0,
    };
  }

  // --- By offer tier breakdown ---
  const offerTierMap = {};
  for (const msg of messages) {
    const tier = msg.offer_tier || 'unknown';
    if (!offerTierMap[tier]) offerTierMap[tier] = { sent: 0, clicked: 0, orders: 0 };
    offerTierMap[tier].sent += 1;
  }

  // Cross-reference events per customer per tier
  const tierEventRows = await db.all(
    `SELECT m.offer_tier, ce.event_type, COUNT(*) as cnt
     FROM communication_events ce
     JOIN messages m ON m.message_id = ce.message_id
     WHERE ce.campaign_id = ? AND ce.duplicate = 0
     GROUP BY m.offer_tier, ce.event_type`,
    [campaign_id]
  );
  const by_offer_tier = { ...offerTierMap };
  for (const row of tierEventRows) {
    const tier = row.offer_tier || 'unknown';
    if (!by_offer_tier[tier]) by_offer_tier[tier] = { sent: 0, clicked: 0, orders: 0 };
    if (row.event_type === 'clicked') by_offer_tier[tier].clicked = row.cnt;
    if (row.event_type === 'order_created') by_offer_tier[tier].orders = row.cnt;
  }

  // --- AI Insight (deterministic) ---
  const ai_insight = generateInsight({
    by_offer_tier,
    by_channel,
    skipped_frequency_cap,
    campaign,
    clicked,
    attributed_orders,
  });

  return {
    campaign_id,
    campaign_name: campaign.campaign_name,
    status: campaign.status,
    sent,
    delivered,
    failed,
    read_or_opened,
    clicked,
    attributed_orders,
    attributed_revenue: parseFloat(attributed_revenue.toFixed(2)),
    delivery_rate,
    click_rate,
    conversion_rate,
    skipped_frequency_cap,
    by_channel,
    by_offer_tier,
    ai_insight,
  };
}

/**
 * Deterministic insight generator.
 */
function generateInsight({ by_offer_tier, by_channel, skipped_frequency_cap, campaign, clicked, attributed_orders }) {
  const campaign_avg_conversion = clicked > 0 ? attributed_orders / clicked : 0;

  // Offer tier rates
  const med = by_offer_tier['medium_risk_10'] || {};
  const high = by_offer_tier['high_risk_15'] || {};
  const med_sent = med.sent || 0;
  const med_orders = med.orders || 0;
  const high_sent = high.sent || 0;
  const high_clicked = high.clicked || 0;
  const high_orders = high.orders || 0;

  const med_conversion = med_sent > 0 ? med_orders / med_sent : 0;
  const high_click_rate = high_sent > 0 ? high_clicked / high_sent : 0;
  const high_order_rate = high_sent > 0 ? high_orders / high_sent : 0;

  if (campaign_avg_conversion > 0 && med_conversion > campaign_avg_conversion * 1.5) {
    const x = (med_conversion / campaign_avg_conversion).toFixed(1);
    return `Medium-risk customers converted ${x}x above average. Keep the 10% offer for this band.`;
  }

  if (high_click_rate > 0.15 && high_order_rate < 0.05) {
    return `High-risk dormant customers clicked but did not complete orders. Try a stronger checkout incentive.`;
  }

  const whatsapp = by_channel['whatsapp'] || {};
  const sms = by_channel['sms'] || by_channel['sms_fallback'] || {};
  const wa_click = whatsapp.click_rate || 0;
  const sms_click = sms.click_rate || 0;

  if (wa_click > 0 && sms_click >= 0 && wa_click > sms_click * 1.5) {
    const x = sms_click > 0 ? (wa_click / sms_click).toFixed(1) : 'significantly';
    return `WhatsApp drove ${x}x higher click-through than SMS. Keep WhatsApp as primary channel.`;
  }

  // Segment rules to determine matched audience size
  let segment_rules = [];
  try {
    segment_rules = JSON.parse(campaign.segment_rules_json || '[]');
  } catch (_) {}

  // Use predicted_metrics_json for matched audience
  let matched_audience = 0;
  try {
    const pred = JSON.parse(campaign.predicted_metrics_json || '{}');
    matched_audience = pred.messages_to_send || 0;
  } catch (_) {}

  if (matched_audience > 0 && skipped_frequency_cap > matched_audience * 0.10) {
    return `A meaningful share of the audience was blocked by contact policy. Wait 2–3 days before rerunning.`;
  }

  return `The play produced steady conversion. Repeat with a smaller A/B test on offer tiers.`;
}

module.exports = { aggregateCampaignAnalytics };
