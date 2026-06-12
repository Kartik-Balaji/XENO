'use strict';

/**
 * Play Engine — Hybrid deterministic + LLM pipeline.
 *
 * Pipeline:
 *   1. intentParser(goal)                        → { playType, matchedKeywords }
 *   2. segmentBuilder(db, playType)               → { eligible_customers[], computed_facts, … }
 *   3. offerLadder(eligible_customers)            → { loyal_points, medium_risk_10, high_risk_15 }
 *   4. channelAdvisor(eligible_customers)         → ['whatsapp', 'sms']
 *   5. sendTimePredictor(eligible_customers)      → ISO timestamp string
 *   6. predictionEngine(eligible_count, channel)  → { messages_to_send, delivered, … }
 *   7. reasoningWriter(facts, …)                  → { reasoning, message_variants }
 *      persistPlay(db, fullPlay)                  → play saved to DB
 */

const { nanoid } = require('nanoid');
const { getDb } = require('../db/db');
const { canSendMessage } = require('./frequencyCap');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLAY_NAMES = {
  spicy_comeback_window: 'Spicy Comeback Window',
  craving_clock:         'Craving Clock',
  store_heat_rescue:     'Store Heat Rescue',
  streak_rescue:         'Streak Rescue',
  new_menu_matchmaker:   'New Menu Matchmaker',
};

const OBJECTIVES = {
  spicy_comeback_window: 'repeat_order_reactivation',
  craving_clock:         'habit_reinforcement',
  store_heat_rescue:     'footfall_recovery',
  streak_rescue:         'streak_retention',
  new_menu_matchmaker:   'menu_discovery',
};

const SEGMENT_NAMES = {
  spicy_comeback_window: 'Dormant Spicy Loyalists',
  craving_clock:         'Craving Clock Customers',
  store_heat_rescue:     'Store Heat Targets',
  streak_rescue:         'Streak Risk Customers',
  new_menu_matchmaker:   'Menu Explorers',
};

const CHANNEL_RATES = {
  whatsapp: { failure: 0.05, read: 0.65, click: 0.12, order: 0.36 },
  sms:      { failure: 0.08, read: 0.00, click: 0.06, order: 0.22 },
  email:    { failure: 0.03, read: 0.35, click: 0.04, order: 0.18 },
  rcs:      { failure: 0.07, read: 0.50, click: 0.10, order: 0.30 },
};

const MEAL_PERIOD_HOURS = {
  breakfast:  8,
  lunch:      12,
  evening:    16,
  dinner:     19,
  late_night: 22,
};

// ---------------------------------------------------------------------------
// Step 1 — Intent Parser
// ---------------------------------------------------------------------------

/**
 * Parse the marketer's goal text into a play type.
 * @param {string} goal
 * @returns {{ playType: string, matchedKeywords: string[] }}
 */
function intentParser(goal) {
  const lower = goal.toLowerCase();

  const KEYWORD_MAP = [
    {
      playType: 'spicy_comeback_window',
      keywords: ["spicy", "dinner", "comeback", "dormant", "haven't ordered", "bring back", "reactivat"],
    },
    {
      playType: 'craving_clock',
      keywords: ["routine", "morning", "evening", "usual", "clock", "time"],
    },
    {
      playType: 'store_heat_rescue',
      keywords: ["store", "low sales", "nearby", "lunch", "location", "footfall"],
    },
    {
      playType: 'streak_rescue',
      keywords: ["streak", "loyalty", "points", "regular", "frequent"],
    },
    {
      playType: 'new_menu_matchmaker',
      keywords: ["new item", "launch", "limited", "lto", "menu"],
    },
  ];

  let bestPlayType = 'spicy_comeback_window';
  let bestCount = 0;
  let bestMatched = [];

  for (const { playType, keywords } of KEYWORD_MAP) {
    const matched = keywords.filter((kw) => lower.includes(kw));
    if (matched.length > bestCount) {
      bestCount = matched.length;
      bestPlayType = playType;
      bestMatched = matched;
    }
  }

  return { playType: bestPlayType, matchedKeywords: bestMatched };
}

// ---------------------------------------------------------------------------
// Step 2 — Segment Builder
// ---------------------------------------------------------------------------

const SEGMENT_QUERIES = {
  spicy_comeback_window: {
    sql: `
      SELECT c.customer_id, c.first_name, c.preferred_store_id,
             c.whatsapp_opt_in, c.sms_opt_in, c.email_opt_in, c.rcs_opt_in,
             d.favorite_category, d.favorite_item, d.usual_meal_period,
             d.usual_order_hour, d.days_since_last_order, d.normal_order_gap_days,
             d.order_rhythm_multiplier, d.discount_sensitivity, d.preferred_channel,
             d.churn_risk_score, d.whatsapp_engagement_score, d.max_channel_engagement_score
      FROM customers c
      JOIN craving_dna d ON c.customer_id = d.customer_id
      WHERE d.favorite_category = 'spicy'
        AND d.days_since_last_order >= 14
        AND (c.whatsapp_opt_in = 1 OR c.sms_opt_in = 1 OR c.email_opt_in = 1 OR c.rcs_opt_in = 1)
    `,
    rules: [
      "favorite_category = spicy",
      "days_since_last_order >= 14",
      "marketing_opt_in = true",
    ],
  },

  craving_clock: {
    sql: `
      SELECT c.customer_id, c.first_name, c.preferred_store_id,
             c.whatsapp_opt_in, c.sms_opt_in, c.email_opt_in, c.rcs_opt_in,
             d.favorite_category, d.favorite_item, d.usual_meal_period,
             d.usual_order_hour, d.days_since_last_order, d.normal_order_gap_days,
             d.order_rhythm_multiplier, d.discount_sensitivity, d.preferred_channel,
             d.churn_risk_score, d.whatsapp_engagement_score, d.max_channel_engagement_score
      FROM customers c
      JOIN craving_dna d ON c.customer_id = d.customer_id
      WHERE d.order_rhythm_multiplier >= 1.2
        AND (c.whatsapp_opt_in = 1 OR c.sms_opt_in = 1 OR c.email_opt_in = 1 OR c.rcs_opt_in = 1)
    `,
    rules: [
      "order_rhythm_multiplier >= 1.2",
      "marketing_opt_in = true",
    ],
  },

  store_heat_rescue: {
    sql: `
      SELECT c.customer_id, c.first_name, c.preferred_store_id,
             c.whatsapp_opt_in, c.sms_opt_in, c.email_opt_in, c.rcs_opt_in,
             d.favorite_category, d.favorite_item, d.usual_meal_period,
             d.usual_order_hour, d.days_since_last_order, d.normal_order_gap_days,
             d.order_rhythm_multiplier, d.discount_sensitivity, d.preferred_channel,
             d.churn_risk_score, d.whatsapp_engagement_score, d.max_channel_engagement_score
      FROM customers c
      JOIN craving_dna d ON c.customer_id = d.customer_id
      WHERE d.days_since_last_order >= 14
        AND (c.whatsapp_opt_in = 1 OR c.sms_opt_in = 1 OR c.email_opt_in = 1 OR c.rcs_opt_in = 1)
      LIMIT 200
    `,
    rules: [
      "days_since_last_order >= 14",
      "marketing_opt_in = true",
    ],
  },

  streak_rescue: {
    sql: `
      SELECT c.customer_id, c.first_name, c.preferred_store_id,
             c.whatsapp_opt_in, c.sms_opt_in, c.email_opt_in, c.rcs_opt_in,
             d.favorite_category, d.favorite_item, d.usual_meal_period,
             d.usual_order_hour, d.days_since_last_order, d.normal_order_gap_days,
             d.order_rhythm_multiplier, d.discount_sensitivity, d.preferred_channel,
             d.churn_risk_score, d.whatsapp_engagement_score, d.max_channel_engagement_score
      FROM customers c
      JOIN craving_dna d ON c.customer_id = d.customer_id
      WHERE d.days_since_last_order < 14
        AND d.max_channel_engagement_score > 0.5
        AND (c.whatsapp_opt_in = 1 OR c.sms_opt_in = 1 OR c.email_opt_in = 1 OR c.rcs_opt_in = 1)
    `,
    rules: [
      "days_since_last_order < 14",
      "max_channel_engagement_score > 0.5",
      "marketing_opt_in = true",
    ],
  },

  new_menu_matchmaker: {
    sql: `
      SELECT c.customer_id, c.first_name, c.preferred_store_id,
             c.whatsapp_opt_in, c.sms_opt_in, c.email_opt_in, c.rcs_opt_in,
             d.favorite_category, d.favorite_item, d.usual_meal_period,
             d.usual_order_hour, d.days_since_last_order, d.normal_order_gap_days,
             d.order_rhythm_multiplier, d.discount_sensitivity, d.preferred_channel,
             d.churn_risk_score, d.whatsapp_engagement_score, d.max_channel_engagement_score
      FROM customers c
      JOIN craving_dna d ON c.customer_id = d.customer_id
      WHERE (c.whatsapp_opt_in = 1 OR c.sms_opt_in = 1 OR c.email_opt_in = 1 OR c.rcs_opt_in = 1)
      LIMIT 300
    `,
    rules: [
      "marketing_opt_in = true",
    ],
  },
};

/**
 * Build the audience segment for a given play type.
 * @param {object} db  - sqlite db instance
 * @param {string} playType
 * @returns {Promise<object>}
 */
async function segmentBuilder(db, playType) {
  const { sql, rules } = SEGMENT_QUERIES[playType] || SEGMENT_QUERIES.spicy_comeback_window;

  const matched_customers = await db.all(sql);
  const matched_count = matched_customers.length;

  // Apply frequency cap — check each customer concurrently
  const capResults = await Promise.all(
    matched_customers.map((c) => canSendMessage(db, c.customer_id))
  );

  const eligible_customers = matched_customers.filter((_, i) => capResults[i]);
  const frequency_cap_excluded = matched_count - eligible_customers.length;
  const eligible_count = eligible_customers.length;

  // Compute aggregate facts from eligible customers
  const computed_facts = _computeFacts(eligible_customers);

  return {
    eligible_customers,
    matched_count,
    frequency_cap_excluded,
    eligible_count,
    rules,
    segment_name: SEGMENT_NAMES[playType] || 'Custom Segment',
    computed_facts,
  };
}

/**
 * Compute aggregate behavioral facts from a customer array.
 * @param {object[]} customers
 * @returns {object}
 */
function _computeFacts(customers) {
  if (!customers.length) {
    return {
      avg_rhythm_multiplier: 1.0,
      pct_dinner_period: 0,
      top_channel: 'whatsapp',
      top_meal_period: 'dinner',
      avg_churn_score: 0.5,
    };
  }

  // avg_rhythm_multiplier
  const avg_rhythm_multiplier = _round1(
    customers.reduce((s, c) => s + (c.order_rhythm_multiplier || 1), 0) / customers.length
  );

  // top_meal_period
  const mealCounts = _countBy(customers, 'usual_meal_period');
  const top_meal_period = _topKey(mealCounts) || 'dinner';

  // pct_dinner_period (% whose meal_period = top_meal_period for "dinner" specifically)
  const dinner_count = customers.filter((c) => c.usual_meal_period === 'dinner').length;
  const pct_dinner_period = Math.round((dinner_count / customers.length) * 100);

  // top_channel
  const channelCounts = _countBy(customers, 'preferred_channel');
  const top_channel = _topKey(channelCounts) || 'whatsapp';

  // avg_churn_score
  const avg_churn_score = _round2(
    customers.reduce((s, c) => s + (c.churn_risk_score || 0), 0) / customers.length
  );

  return { avg_rhythm_multiplier, pct_dinner_period, top_channel, top_meal_period, avg_churn_score };
}

// ---------------------------------------------------------------------------
// Step 3 — Offer Ladder
// ---------------------------------------------------------------------------

/**
 * Assign offer tiers to eligible customers based on churn_risk_score.
 * @param {object[]} eligible_customers
 * @returns {object}
 */
function offerLadder(eligible_customers) {
  const tiers = { loyal_points: 0, medium_risk_10: 0, high_risk_15: 0 };

  for (const c of eligible_customers) {
    const score = c.churn_risk_score || 0;
    if (score < 0.35) {
      tiers.loyal_points++;
    } else if (score < 0.70) {
      tiers.medium_risk_10++;
    } else {
      tiers.high_risk_15++;
    }
  }

  return {
    loyal_points:  { count: tiers.loyal_points,  offer_id: 'offer_loyal_points', label: '2x loyalty points' },
    medium_risk_10:{ count: tiers.medium_risk_10, offer_id: 'offer_medium_10',    label: '10% off' },
    high_risk_15:  { count: tiers.high_risk_15,   offer_id: 'offer_high_15',      label: '15% off' },
  };
}

// ---------------------------------------------------------------------------
// Step 4 — Channel Advisor
// ---------------------------------------------------------------------------

/**
 * Recommend channels based on customer preferred_channel distribution.
 * @param {object[]} eligible_customers
 * @returns {string[]}  ordered array, e.g. ['whatsapp', 'sms']
 */
function channelAdvisor(eligible_customers) {
  const counts = _countBy(eligible_customers, 'preferred_channel');
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  // Return top 2 channels; always ensure at least ['whatsapp', 'sms']
  const top = sorted.slice(0, 2).map(([ch]) => ch);
  if (top.length === 0) return ['whatsapp', 'sms'];
  if (top.length === 1) return [top[0], top[0] === 'whatsapp' ? 'sms' : 'whatsapp'];
  return top;
}

// ---------------------------------------------------------------------------
// Step 5 — Send Time Predictor
// ---------------------------------------------------------------------------

/**
 * Predict the optimal send time from customer meal period distribution.
 * @param {object[]} eligible_customers
 * @returns {string}  ISO 8601 timestamp (today at predicted send hour)
 */
function sendTimePredictor(eligible_customers) {
  const mealCounts = _countBy(eligible_customers, 'usual_meal_period');
  const top_meal_period = _topKey(mealCounts) || 'dinner';

  const peakHour = MEAL_PERIOD_HOURS[top_meal_period] ?? 19;
  // Send 30 minutes before peak
  const sendHour   = peakHour;
  const sendMinute = 30;  // 30 min before peak within the same hour bracket

  const now = new Date();
  const sendDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    sendHour,
    sendMinute,
    0,
    0
  );

  return sendDate.toISOString();
}

// ---------------------------------------------------------------------------
// Step 6 — Prediction Engine
// ---------------------------------------------------------------------------

/**
 * Predict campaign metrics using channel-specific rate constants.
 * @param {number} eligible_count
 * @param {string} top_channel
 * @returns {object}
 */
function predictionEngine(eligible_count, top_channel) {
  const r = CHANNEL_RATES[top_channel] || CHANNEL_RATES.whatsapp;

  const messages_to_send = eligible_count;
  const delivered        = Math.round(messages_to_send * (1 - r.failure));
  const read_or_opened   = Math.round(delivered * r.read);
  const clicked          = Math.round(delivered * r.click);
  const orders           = Math.round(clicked * r.order);
  const revenue          = orders * 460;  // avg order value INR

  return { messages_to_send, delivered, read_or_opened, clicked, orders, revenue };
}

// ---------------------------------------------------------------------------
// Step 7 — Reasoning Writer
// ---------------------------------------------------------------------------

/**
 * Format an ISO timestamp to a human-readable time string.
 * @param {string} isoString
 * @returns {string}
 */
function _formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return isoString;
  }
}

/**
 * Build deterministic reasoning text and message variants.
 * Optionally enhance reasoning via Gemini LLM if API key is present.
 *
 * @param {object} computed_facts
 * @param {string} playType
 * @param {object} offerTiers
 * @param {string} sendTime
 * @param {object} predictions
 * @returns {Promise<{ reasoning: string, message_variants: object }>}
 */
async function reasoningWriter(computed_facts, playType, offerTiers, sendTime, predictions) {
  const { avg_rhythm_multiplier, pct_dinner_period, top_channel, top_meal_period } = computed_facts;

  // --- Deterministic template (always computed first as fallback) ---
  const rhythm_text = avg_rhythm_multiplier > 1
    ? `${avg_rhythm_multiplier}x past their normal order rhythm`
    : 'within their normal order rhythm';

  const deterministicReasoning =
    `These customers are ${rhythm_text}, ` +
    `${pct_dinner_period}% usually order during ${top_meal_period}, ` +
    `and ${top_channel} has historically produced the highest engagement for this group. ` +
    `Tonight at ${_formatTime(sendTime)} is the strongest craving window. ` +
    `The offer ladder protects margin: loyal customers earn bonus points while high-risk dormant customers receive the strongest incentive.`;

  // --- Message variants (deterministic — use template variables) ---
  const message_variants = {
    loyal:
      `Hey {first_name}, your {favorite_item} streak is heating up 🌶️ Order tonight and earn 2x loyalty points.`,
    medium:
      `{first_name}, your usual {favorite_item} is waiting. Get 10% off if you order before 10 PM.`,
    high_risk:
      `{first_name}, it's been a while. Come back tonight with 15% off your {favorite_item} combo.`,
  };

  let reasoning = deterministicReasoning;

  // --- Optional LLM enhancement via Gemini ---
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const campaignData = {
        play_type: playType,
        ...computed_facts,
        offer_tiers: {
          loyal_points:   offerTiers.loyal_points.count,
          medium_risk_10: offerTiers.medium_risk_10.count,
          high_risk_15:   offerTiers.high_risk_15.count,
        },
        predictions,
        send_time: sendTime,
      };

      const prompt =
        `You are writing a one-paragraph marketer-facing campaign reasoning for a QSR CRM.\n` +
        `Campaign data: ${JSON.stringify(campaignData)}\n` +
        `Write one specific paragraph (3-4 sentences) explaining WHY this audience was selected, ` +
        `what behavioral signal triggered this play, and what the recommended action is.\n` +
        `Be specific about the numbers. Do not give generic marketing advice. ` +
        `Output only the paragraph, no headers or formatting.`;

      const result = await model.generateContent(prompt);
      const llmText = result.response.text().trim();

      if (llmText && llmText.length > 20) {
        reasoning = llmText;
      }
    } catch (err) {
      // LLM call failed — fall back to deterministic template silently
      console.warn('[playEngine] Gemini LLM call failed, using deterministic fallback:', err.message);
      reasoning = deterministicReasoning;
    }
  }

  return { reasoning, message_variants };
}

// ---------------------------------------------------------------------------
// Persist Play to DB
// ---------------------------------------------------------------------------

/**
 * Insert a generated play into the plays table.
 * The route also does an upsert, so this is an additional internal save.
 * We do INSERT OR IGNORE here so the route's INSERT OR REPLACE wins.
 * @param {object} db
 * @param {object} play
 */
async function persistPlay(db, play) {
  const now = new Date().toISOString();
  await db.run(
    `INSERT OR IGNORE INTO plays
       (play_id, play_name, objective, goal_text, audience_json, reasoning,
        recommended_send_time, recommended_channels, offer_strategy,
        message_variants_json, predicted_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      play.play_id,
      play.play_name,
      play.objective,
      play.goal_text,
      JSON.stringify(play.audience),
      play.reasoning,
      play.recommended_send_time,
      JSON.stringify(play.recommended_channels),
      JSON.stringify(play.offer_ladder),
      JSON.stringify(play.message_variants),
      JSON.stringify(play.predicted),
      now,
    ]
  );
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Generate a complete play from a marketer's goal string.
 * Opens its own DB connection via getDb().
 *
 * @param {string} goal  - natural-language goal text
 * @returns {Promise<object>}  Full play object
 */
async function generatePlay(goal) {
  const db = await getDb();

  // Step 1 — Intent Parser
  const { playType, matchedKeywords } = intentParser(goal);

  // Step 2 — Segment Builder
  const {
    eligible_customers,
    matched_count,
    frequency_cap_excluded,
    eligible_count,
    rules,
    segment_name,
    computed_facts,
  } = await segmentBuilder(db, playType);

  // Step 3 — Offer Ladder
  const offer_ladder = offerLadder(eligible_customers);

  // Step 4 — Channel Advisor
  const recommended_channels = channelAdvisor(eligible_customers);

  // Step 5 — Send Time Predictor
  const recommended_send_time = sendTimePredictor(eligible_customers);

  // Step 6 — Prediction Engine
  const predicted = predictionEngine(eligible_count, recommended_channels[0]);

  // Step 7 — Reasoning Writer (may call Gemini; has deterministic fallback)
  const { reasoning, message_variants } = await reasoningWriter(
    computed_facts,
    playType,
    offer_ladder,
    recommended_send_time,
    predicted
  );

  // Assemble full play object
  const play = {
    play_id:   `play_${nanoid(12)}`,
    play_name: PLAY_NAMES[playType] || 'Custom Play',
    objective: OBJECTIVES[playType] || 'engagement',
    goal_text: goal,
    audience: {
      segment_name,
      matched_count,
      frequency_cap_excluded,
      eligible_count,
      rules,
      computed_facts,
    },
    reasoning,
    recommended_send_time,
    recommended_channels,
    offer_ladder,
    message_variants,
    predicted,
    _meta: {
      play_type:       playType,
      matched_keywords: matchedKeywords,
      generated_at:    new Date().toISOString(),
    },
  };

  // Persist to DB (internal save; route also upserts)
  await persistPlay(db, play);

  return play;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Count occurrences of a field across an array of objects. */
function _countBy(arr, field) {
  const counts = {};
  for (const item of arr) {
    const val = item[field] || 'unknown';
    counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}

/** Return the key with the highest count. */
function _topKey(countObj) {
  let topKey = null;
  let topVal = -Infinity;
  for (const [k, v] of Object.entries(countObj)) {
    if (v > topVal) { topVal = v; topKey = k; }
  }
  return topKey;
}

/** Round to 1 decimal place. */
function _round1(n) { return Math.round(n * 10) / 10; }

/** Round to 2 decimal places. */
function _round2(n) { return Math.round(n * 100) / 100; }

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  generatePlay,
  // Expose individual steps for testing
  intentParser,
  segmentBuilder,
  offerLadder,
  channelAdvisor,
  sendTimePredictor,
  predictionEngine,
  reasoningWriter,
};
