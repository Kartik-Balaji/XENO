'use strict';

/**
 * CraveStop Mini-CRM — Deterministic Seed Script
 * All randomness flows from a fixed seed (42) via mulberry32 PRNG.
 * Run: node src/db/seed.js
 */

const { getDb } = require('./db');
const { nanoid } = require('nanoid');

// ─── Seeded PRNG (mulberry32) ────────────────────────────────────────────────
let _prng_state = 42;
function mulberry32(seed) { _prng_state = seed; }
function rand() {
  _prng_state |= 0;
  _prng_state = _prng_state + 0x6D2B79F5 | 0;
  let t = Math.imul(_prng_state ^ _prng_state >>> 15, 1 | _prng_state);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
mulberry32(42); // init

function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function weighted(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// Deterministic nanoid — uses PRNG to generate predictable IDs
function did(size = 21) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let id = '';
  for (let i = 0; i < size; i++) id += chars[Math.floor(rand() * 64)];
  return id;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const NOW = new Date('2026-06-10T00:00:00.000Z');
const NOW_MS = NOW.getTime();
const DAY_MS = 86400000;

// ─── Reference data ──────────────────────────────────────────────────────────
const STORES = [
  { store_id: 'store_del_cp',          name: 'UrbanBite Connaught Place', city: 'Delhi' },
  { store_id: 'store_mum_bkc',         name: 'UrbanBite BKC',            city: 'Mumbai' },
  { store_id: 'store_blr_indiranagar', name: 'UrbanBite Indiranagar',    city: 'Bengaluru' },
  { store_id: 'store_hyd_hitech',      name: 'UrbanBite Hitec City',     city: 'Hyderabad' },
  { store_id: 'store_pune_kp',         name: 'UrbanBite Koregaon Park',  city: 'Pune' },
];

const MENU_ITEMS = [
  { sku: 'sku_volcano_burrito',   name: 'Volcano Burrito',              category: 'spicy',   price: 299 },
  { sku: 'sku_fire_taco',         name: 'Fire Crunch Taco',             category: 'spicy',   price: 199 },
  { sku: 'sku_spicy_wrap',        name: 'Spicy Paneer Wrap',            category: 'spicy',   price: 229 },
  { sku: 'sku_ghost_pepper_bowl', name: 'Ghost Pepper Rice Bowl',       category: 'spicy',   price: 259 },
  { sku: 'sku_iced_latte',        name: 'Iced Latte',                   category: 'coffee',  price: 240 },
  { sku: 'sku_caramel_cold_brew', name: 'Caramel Cold Brew',            category: 'coffee',  price: 260 },
  { sku: 'sku_filter_coffee',     name: 'South Indian Filter Coffee',   category: 'coffee',  price: 180 },
  { sku: 'sku_churros',           name: 'Churros',                      category: 'dessert', price: 159 },
  { sku: 'sku_brownie',           name: 'Fudge Brownie',                category: 'dessert', price: 149 },
  { sku: 'sku_loaded_fries',      name: 'Loaded Fries',                 category: 'sides',   price: 179 },
  { sku: 'sku_nachos',            name: 'Cheese Nachos',                category: 'sides',   price: 199 },
  { sku: 'sku_protein_bowl',      name: 'Protein Power Bowl',           category: 'bowls',   price: 319 },
  { sku: 'sku_buddha_bowl',       name: 'Buddha Bowl',                  category: 'bowls',   price: 299 },
  { sku: 'sku_classic_wrap',      name: 'Classic Chicken Wrap',         category: 'wraps',   price: 209 },
  { sku: 'sku_combo_value',       name: 'Value Combo Meal',             category: 'value',   price: 249 },
  { sku: 'sku_mini_meal',         name: 'Mini Meal Deal',               category: 'value',   price: 179 },
  { sku: 'sku_truffle_fries',     name: 'Truffle Parmesan Fries',       category: 'lto',     price: 229 },
  { sku: 'sku_mango_habanero',    name: 'Mango Habanero Wrap',          category: 'lto',     price: 249 },
  { sku: 'sku_oat_milk_latte',    name: 'Oat Milk Latte',               category: 'coffee',  price: 270 },
  { sku: 'sku_comfort_bowl',      name: 'Mac & Cheese Comfort Bowl',    category: 'bowls',   price: 279 },
];

// Indian first names by region
const NAMES_BY_CITY = {
  Delhi: {
    first: ['Arjun','Priya','Rohan','Neha','Vikram','Sunita','Amit','Kavita','Sanjay','Pooja',
             'Rahul','Anita','Deepak','Meera','Suresh','Rekha','Manish','Seema','Rajesh','Nisha'],
    last:  ['Sharma','Gupta','Verma','Singh','Malhotra','Kapoor','Arora','Bhatia','Khanna','Jain']
  },
  Mumbai: {
    first: ['Akash','Sneha','Kiran','Pallavi','Nikhil','Shruti','Mohit','Ritu','Vivek','Leena',
             'Gaurav','Anjali','Sunil','Priyanka','Ravi','Sonal','Dinesh','Hiral','Jayesh','Mita'],
    last:  ['Patil','Shah','Mehta','Desai','Joshi','Nair','Kulkarni','Thakkar','Patel','Bhatt']
  },
  Bengaluru: {
    first: ['Aditya','Divya','Prashanth','Kavitha','Srinivas','Nandini','Karthik','Shruthi','Rajan','Vidya',
             'Harish','Sowmya','Venkat','Bhavana','Suresh','Mythili','Girish','Ramya','Naveen','Aparna'],
    last:  ['Reddy','Rao','Krishnaswamy','Hegde','Gowda','Naidu','Murthy','Iyer','Shetty','Swamy']
  },
  Hyderabad: {
    first: ['Anil','Padmaja','Rajesh','Srilakshmi','Ravi','Vani','Kishore','Madhavi','Srikanth','Sujatha',
             'Naresh','Lakshmi','Vijay','Prasanna','Suresh','Rekha','Santosh','Kavitha','Ramesh','Usha'],
    last:  ['Reddy','Rao','Sharma','Naidu','Chandra','Kumar','Varma','Gupta','Pillai','Nair']
  },
  Pune: {
    first: ['Sachin','Prachi','Aniket','Rutuja','Omkar','Gauri','Swapnil','Shraddha','Pratik','Aishwarya',
             'Amol','Madhura','Rohan','Namrata','Nilesh','Sonali','Kedar','Smita','Hemant','Varsha'],
    last:  ['Kulkarni','Joshi','Deshpande','Patil','Bhosale','Kadam','More','Shinde','Pawar','Gaikwad']
  }
};

const CITIES = ['Delhi','Mumbai','Bengaluru','Hyderabad','Pune'];
const CITY_WEIGHTS = [25, 25, 25, 15, 10];
const CITY_TO_STORE = {
  Delhi:     'store_del_cp',
  Mumbai:    'store_mum_bkc',
  Bengaluru: 'store_blr_indiranagar',
  Hyderabad: 'store_hyd_hitech',
  Pune:      'store_pune_kp',
};

const LOYALTY_TIERS = ['Bronze','Silver','Gold','Platinum'];
const LOYALTY_WEIGHTS = [35, 30, 25, 10];
const TIER_POINTS = { Bronze: [0,500], Silver: [501,2000], Gold: [2001,8000], Platinum: [8001,25000] };

const FAV_CATEGORIES = ['spicy','coffee','dessert','comfort','value','healthy-ish'];
const FAV_CAT_WEIGHTS = [30, 20, 15, 15, 10, 10];

const CHANNELS = ['whatsapp','sms','email','rcs'];
const CHANNEL_WEIGHTS = [45, 25, 20, 10];

const ORDER_CHANNELS = ['app','web','in_store'];
const ORDER_CHANNEL_WEIGHTS = [50, 30, 20];
const FULFILLMENT_TYPES = ['delivery','pickup','dine_in'];
const FULFILLMENT_WEIGHTS = [50, 30, 20];

// ─── Helper: meal period from hour ──────────────────────────────────────────
function mealPeriodFromHour(h) {
  if (h >= 6 && h <= 10) return 'breakfast';
  if (h >= 11 && h <= 14) return 'lunch';
  if (h >= 15 && h <= 17) return 'evening';
  if (h >= 18 && h <= 22) return 'dinner';
  return 'late_night';
}

// ─── Helper: mode of array ───────────────────────────────────────────────────
function mode(arr) {
  if (!arr.length) return null;
  const freq = {};
  let maxF = 0, best = arr[0];
  for (const v of arr) {
    freq[v] = (freq[v] || 0) + 1;
    if (freq[v] > maxF) { maxF = freq[v]; best = v; }
  }
  return best;
}

// ─── Helper: median ──────────────────────────────────────────────────────────
function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ─── Generate customers ──────────────────────────────────────────────────────
function generateCustomers(n) {
  const customers = [];
  const cityCounters = {};

  for (let i = 0; i < n; i++) {
    const city = weighted(CITIES, CITY_WEIGHTS);
    cityCounters[city] = (cityCounters[city] || 0) + 1;
    const idx = cityCounters[city];

    const namePool = NAMES_BY_CITY[city];
    const first_name = pick(namePool.first);
    const last_name = pick(namePool.last);
    const phone = `+91${randInt(7000000000, 9999999999)}`;
    const emailDomains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','rediffmail.com'];
    const email = `${first_name.toLowerCase()}${randInt(10,999)}@${pick(emailDomains)}`;

    const loyalty_tier = weighted(LOYALTY_TIERS, LOYALTY_WEIGHTS);
    const [pMin, pMax] = TIER_POINTS[loyalty_tier];
    const points_balance = randInt(pMin, pMax);

    const app_user = rand() < 0.70 ? 1 : 0;
    const whatsapp_opt_in = rand() < 0.80 ? 1 : 0;
    const sms_opt_in = rand() < 0.80 ? 1 : 0;
    const email_opt_in = rand() < 0.80 ? 1 : 0;
    const rcs_opt_in = rand() < 0.80 ? 1 : 0;

    // Account creation: 1–3 years ago
    const daysAgo = randInt(180, 1100);
    const created_at = new Date(NOW_MS - daysAgo * DAY_MS).toISOString();

    customers.push({
      customer_id: did(),
      first_name,
      last_name,
      phone,
      email,
      city,
      preferred_store_id: CITY_TO_STORE[city],
      loyalty_tier,
      points_balance,
      app_user,
      whatsapp_opt_in,
      sms_opt_in,
      email_opt_in,
      rcs_opt_in,
      created_at,
    });
  }
  return customers;
}

// ─── Generate orders ─────────────────────────────────────────────────────────
function generateOrders(customers) {
  const allOrders = [];
  const allItems = [];

  // Target ~3000 orders across 500 customers → avg 6
  // Distribution: some get 1-2, some get 10-15
  const orderCountDistribution = [];
  for (let i = 0; i < customers.length; i++) {
    // 10% get 1-2, 20% get 3-4, 40% get 5-8, 20% get 9-12, 10% get 13-15
    const r = rand();
    let cnt;
    if (r < 0.10) cnt = randInt(1, 2);
    else if (r < 0.30) cnt = randInt(3, 4);
    else if (r < 0.70) cnt = randInt(5, 8);
    else if (r < 0.90) cnt = randInt(9, 12);
    else cnt = randInt(13, 15);
    orderCountDistribution.push(cnt);
  }

  for (let ci = 0; ci < customers.length; ci++) {
    const cust = customers[ci];
    const nOrders = orderCountDistribution[ci];

    for (let oi = 0; oi < nOrders; oi++) {
      const order_id = did();

      // Spread orders across last 180 days
      const daysBack = rand() * 180;
      const hour = weighted(
        [7, 8, 9, 12, 13, 16, 19, 20, 21, 23, 0, 1],
        [5, 8, 5, 12, 12,  8, 12, 10,  8,  5, 3, 2]
      );
      const orderDate = new Date(NOW_MS - daysBack * DAY_MS);
      orderDate.setUTCHours(hour, randInt(0, 59), randInt(0, 59), 0);
      const order_time = orderDate.toISOString();
      const meal_period = mealPeriodFromHour(hour);

      const order_channel = weighted(ORDER_CHANNELS, ORDER_CHANNEL_WEIGHTS);
      const fulfillment_type = weighted(FULFILLMENT_TYPES, FULFILLMENT_WEIGHTS);

      // Order value: 150–650 range
      const hasDiscount = rand() < 0.30;
      const baseValue = randInt(150, 650);
      const discount_used = hasDiscount ? Math.round(baseValue * (rand() * 0.05 + 0.10)) : 0;
      const order_value = baseValue - discount_used;

      allOrders.push({
        order_id,
        customer_id: cust.customer_id,
        store_id: cust.preferred_store_id,
        order_time,
        order_channel,
        fulfillment_type,
        meal_period,
        order_value: Math.round(order_value * 100) / 100,
        discount_used,
        attributed_campaign_id: null,
        attribution_source: null,
      });

      // 1–3 items per order
      const nItems = randInt(1, 3);
      let runningTotal = 0;
      const usedSkus = new Set();
      for (let ii = 0; ii < nItems; ii++) {
        let menuItem;
        // Try to pick unique items per order
        for (let attempt = 0; attempt < 5; attempt++) {
          menuItem = pick(MENU_ITEMS);
          if (!usedSkus.has(menuItem.sku)) break;
        }
        usedSkus.add(menuItem.sku);
        const quantity = randInt(1, 2);
        const unit_price = menuItem.price;
        runningTotal += unit_price * quantity;

        allItems.push({
          order_item_id: did(),
          order_id,
          sku: menuItem.sku,
          item_name: menuItem.name,
          category: menuItem.category,
          quantity,
          unit_price,
        });
      }
    }
  }

  return { allOrders, allItems };
}

// ─── Compute craving_dna ─────────────────────────────────────────────────────
function computeCravingDna(customers, allOrders, allItems) {
  // Build lookup maps
  const ordersByCustomer = {};
  for (const o of allOrders) {
    if (!ordersByCustomer[o.customer_id]) ordersByCustomer[o.customer_id] = [];
    ordersByCustomer[o.customer_id].push(o);
  }
  const itemsByOrder = {};
  for (const it of allItems) {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
    itemsByOrder[it.order_id].push(it);
  }

  const dnas = [];
  for (const cust of customers) {
    const orders = ordersByCustomer[cust.customer_id] || [];
    const sortedOrders = [...orders].sort((a, b) => a.order_time.localeCompare(b.order_time));

    // Collect all items for this customer
    const items = orders.flatMap(o => itemsByOrder[o.order_id] || []);

    // favorite_category & favorite_item
    const catFreq = {}, skuFreq = {}, skuName = {};
    for (const it of items) {
      catFreq[it.category] = (catFreq[it.category] || 0) + 1;
      skuFreq[it.sku] = (skuFreq[it.sku] || 0) + 1;
      skuName[it.sku] = it.item_name;
    }
    const favorite_category = Object.keys(catFreq).sort((a, b) => catFreq[b] - catFreq[a])[0] || 'spicy';
    const favSkuKey = Object.keys(skuFreq).sort((a, b) => skuFreq[b] - skuFreq[a])[0];
    const favorite_item = favSkuKey ? skuName[favSkuKey] : null;

    // usual_meal_period & usual_order_hour
    const mealPeriods = orders.map(o => o.meal_period);
    const usual_meal_period = mode(mealPeriods) || 'dinner';
    const hours = orders.map(o => new Date(o.order_time).getUTCHours());
    const usual_order_hour = mode(hours) !== null ? mode(hours) : 19;

    // days_since_last_order
    const lastOrderTime = sortedOrders.length
      ? new Date(sortedOrders[sortedOrders.length - 1].order_time).getTime()
      : NOW_MS - 90 * DAY_MS;
    const days_since_last_order = Math.floor((NOW_MS - lastOrderTime) / DAY_MS);

    // normal_order_gap_days (median gap between consecutive orders)
    let normal_order_gap_days = 30;
    if (sortedOrders.length >= 2) {
      const gaps = [];
      for (let i = 1; i < sortedOrders.length; i++) {
        const gapMs = new Date(sortedOrders[i].order_time) - new Date(sortedOrders[i - 1].order_time);
        gaps.push(Math.max(1, Math.floor(gapMs / DAY_MS)));
      }
      normal_order_gap_days = Math.max(1, Math.round(median(gaps)));
    }

    // order_rhythm_multiplier
    const order_rhythm_multiplier = Math.round((days_since_last_order / Math.max(normal_order_gap_days, 1)) * 100) / 100;

    // discount_sensitivity
    const ordersWithDiscount = orders.filter(o => o.discount_used > 0).length;
    const discountRatio = orders.length ? ordersWithDiscount / orders.length : 0;
    const discount_sensitivity =
      discountRatio < 0.20 ? 'low' : discountRatio <= 0.50 ? 'medium' : 'high';

    // Channel engagement scores (0.0–1.0)
    const tierMultiplier = { Bronze: 0.4, Silver: 0.55, Gold: 0.72, Platinum: 0.90 }[cust.loyalty_tier] || 0.5;
    function engagementScore(optedIn, isPrimary) {
      if (!optedIn) return 0.0;
      const base = isPrimary ? tierMultiplier + 0.05 : tierMultiplier - 0.10;
      const noise = (rand() - 0.5) * 0.15;
      return Math.max(0.01, Math.min(0.99, Math.round((base + noise) * 100) / 100));
    }

    // Determine a raw preferred channel for this customer (from weights, but respect opt-ins)
    const rawChannel = weighted(CHANNELS, CHANNEL_WEIGHTS);
    const optIns = {
      whatsapp: cust.whatsapp_opt_in,
      sms:      cust.sms_opt_in,
      email:    cust.email_opt_in,
      rcs:      cust.rcs_opt_in,
    };

    const whatsapp_engagement_score = engagementScore(optIns.whatsapp, rawChannel === 'whatsapp');
    const sms_engagement_score      = engagementScore(optIns.sms,      rawChannel === 'sms');
    const email_engagement_score    = engagementScore(optIns.email,    rawChannel === 'email');
    const rcs_engagement_score      = engagementScore(optIns.rcs,      rawChannel === 'rcs');

    const scores = { whatsapp: whatsapp_engagement_score, sms: sms_engagement_score, email: email_engagement_score, rcs: rcs_engagement_score };
    const max_channel_engagement_score = Math.max(...Object.values(scores));
    // preferred_channel = channel with highest engagement score (among opted-in channels)
    const preferred_channel = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];

    // churn_risk_score
    const ordersLast90d = orders.filter(o => {
      const t = new Date(o.order_time).getTime();
      return t >= NOW_MS - 90 * DAY_MS;
    }).length;
    const recency_component    = Math.min(days_since_last_order / 60, 1.0) * 0.45;
    const rhythm_component     = Math.min(order_rhythm_multiplier / 3, 1.0) * 0.25;
    const frequency_component  = (1 - Math.min(ordersLast90d / 10, 1.0)) * 0.15;
    const engagement_component = (1 - max_channel_engagement_score) * 0.15;
    const churn_risk_score = Math.round((recency_component + rhythm_component + frequency_component + engagement_component) * 100) / 100;

    // predicted_next_best_play
    function predictPlay(favCat, churnRisk) {
      if (churnRisk >= 0.60) return 'win_back_deep_dormant';
      if (churnRisk >= 0.40) return 'win_back_warm';
      if (favCat === 'spicy') return 'spicy_upsell';
      if (favCat === 'coffee') return 'coffee_loyalty_boost';
      if (favCat === 'dessert') return 'dessert_cross_sell';
      if (favCat === 'value') return 'value_retention';
      return 'menu_discovery';
    }

    dnas.push({
      customer_id: cust.customer_id,
      favorite_category,
      favorite_item,
      usual_meal_period,
      usual_order_hour,
      days_since_last_order,
      normal_order_gap_days,
      order_rhythm_multiplier,
      discount_sensitivity,
      preferred_channel,
      whatsapp_engagement_score,
      sms_engagement_score,
      email_engagement_score,
      rcs_engagement_score,
      max_channel_engagement_score,
      churn_risk_score,
      predicted_next_best_play: predictPlay(favorite_category, churn_risk_score),
      computed_at: NOW.toISOString(),
    });
  }

  return dnas;
}

// ─── Campaigns ───────────────────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    campaign_id: 'camp_spicy_draft',
    play_id: 'play_spicy_upsell',
    campaign_name: 'Spicy Comeback Window',
    objective: 'Re-engage spicy lovers who haven\'t ordered in 14+ days',
    status: 'draft',
    segment_rules_json: JSON.stringify({ favorite_category: 'spicy', days_since_last_order_gte: 14 }),
    reasoning: 'Spicy category fans have high repeat purchase intent; a targeted offer can pull them back.',
    recommended_send_time: '2026-06-12T19:00:00.000Z',
    predicted_metrics_json: JSON.stringify({ reach: 150, open_rate: 0.72, conversion_rate: 0.18 }),
    created_at: '2026-06-09T10:00:00.000Z',
    launched_at: null,
    completed_at: null,
  },
  {
    campaign_id: 'camp_clock_scheduled',
    play_id: 'play_craving_clock',
    campaign_name: 'Craving Clock',
    objective: 'Reach customers at their usual meal period',
    status: 'scheduled',
    segment_rules_json: JSON.stringify({ usual_meal_period: 'dinner', churn_risk_lte: 0.50 }),
    reasoning: 'Timing messages to match customer meal habits improves open and click rates by ~30%.',
    recommended_send_time: '2026-06-11T18:30:00.000Z',
    predicted_metrics_json: JSON.stringify({ reach: 220, open_rate: 0.68, conversion_rate: 0.22 }),
    created_at: '2026-06-08T14:00:00.000Z',
    launched_at: '2026-06-10T09:00:00.000Z',
    completed_at: null,
  },
  {
    campaign_id: 'camp_store_sending',
    play_id: 'play_store_heat',
    campaign_name: 'Store Heat Rescue',
    objective: 'Drive footfall to stores with low recent orders',
    status: 'sending',
    segment_rules_json: JSON.stringify({ city: ['Delhi','Mumbai'], days_since_last_order_gte: 21 }),
    reasoning: 'Store-specific offers create urgency and increase in-store visits.',
    recommended_send_time: '2026-06-10T12:00:00.000Z',
    predicted_metrics_json: JSON.stringify({ reach: 300, open_rate: 0.65, conversion_rate: 0.15 }),
    created_at: '2026-06-07T11:00:00.000Z',
    launched_at: '2026-06-10T12:00:00.000Z',
    completed_at: null,
  },
  {
    campaign_id: 'camp_menu_completed',
    play_id: 'play_menu_matchmaker',
    campaign_name: 'New Menu Matchmaker',
    objective: 'Introduce new menu items matched to customer taste profiles',
    status: 'completed',
    segment_rules_json: JSON.stringify({ all_customers: true }),
    reasoning: 'Personalized menu recommendations drive 2x more engagement than generic broadcasts.',
    recommended_send_time: '2026-05-15T18:00:00.000Z',
    predicted_metrics_json: JSON.stringify({ reach: 480, open_rate: 0.70, conversion_rate: 0.20 }),
    created_at: '2026-05-13T10:00:00.000Z',
    launched_at: '2026-05-15T18:00:00.000Z',
    completed_at: '2026-05-16T06:00:00.000Z',
  },
];

// ─── Offers ──────────────────────────────────────────────────────────────────
const OFFERS = [
  {
    offer_id: 'offer_loyal_points',
    offer_tier: 'loyal',
    offer_type: 'bonus_points',
    value: 200,
    description: 'Earn 2x loyalty points on your next order',
    expires_at: '2026-07-31T23:59:59.000Z',
  },
  {
    offer_id: 'offer_medium_10',
    offer_tier: 'medium',
    offer_type: 'percent_off',
    value: 10,
    description: '10% off your next order',
    expires_at: '2026-07-31T23:59:59.000Z',
  },
  {
    offer_id: 'offer_high_15',
    offer_tier: 'high',
    offer_type: 'percent_off',
    value: 15,
    description: '15% off — we miss you!',
    expires_at: '2026-07-31T23:59:59.000Z',
  },
];

// ─── Plays ───────────────────────────────────────────────────────────────────
const PLAYS = [
  {
    play_id: 'play_spicy_upsell',
    play_name: 'Spicy Upsell',
    objective: 'Upsell spicy lovers',
    goal_text: 'Get spicy category fans to try premium spicy items',
    audience_json: JSON.stringify({ favorite_category: 'spicy' }),
    reasoning: 'Spicy lovers are loyal; premium upsells boost AOV.',
    recommended_send_time: 'dinner',
    recommended_channels: 'whatsapp,sms',
    offer_strategy: 'bonus_points for Gold/Platinum, percent_off for Bronze/Silver',
    message_variants_json: JSON.stringify([{ channel: 'whatsapp', template: 'Hey {name}, your next Volcano Burrito awaits!' }]),
    predicted_json: JSON.stringify({ lift: 0.18, aov_increase: 45 }),
    created_at: '2026-06-01T10:00:00.000Z',
  },
  {
    play_id: 'play_craving_clock',
    play_name: 'Craving Clock',
    objective: 'Time-matched engagement',
    goal_text: 'Send messages when customers are most likely to order',
    audience_json: JSON.stringify({ usual_meal_period: 'dinner' }),
    reasoning: 'Temporal targeting lifts conversion 30%.',
    recommended_send_time: 'meal_period_specific',
    recommended_channels: 'whatsapp,rcs',
    offer_strategy: 'soft nudge, no discount needed',
    message_variants_json: JSON.stringify([{ channel: 'whatsapp', template: 'Dinner time, {name}! Ready to order your favourite?' }]),
    predicted_json: JSON.stringify({ lift: 0.22, engagement_rate: 0.68 }),
    created_at: '2026-06-01T10:00:00.000Z',
  },
  {
    play_id: 'play_store_heat',
    play_name: 'Store Heat Rescue',
    objective: 'Drive footfall',
    goal_text: 'Get lapsed customers back into stores',
    audience_json: JSON.stringify({ days_since_last_order_gte: 21, channel: 'in_store' }),
    reasoning: 'Store-specific offers create urgency.',
    recommended_send_time: 'lunch',
    recommended_channels: 'sms,email',
    offer_strategy: '15% off for dormant, 10% for warm',
    message_variants_json: JSON.stringify([{ channel: 'sms', template: 'Miss us? Visit {store} and get {offer}' }]),
    predicted_json: JSON.stringify({ footfall_lift: 0.15, conversion_rate: 0.20 }),
    created_at: '2026-06-01T10:00:00.000Z',
  },
  {
    play_id: 'play_menu_matchmaker',
    play_name: 'New Menu Matchmaker',
    objective: 'Menu discovery',
    goal_text: 'Introduce new items matched to taste profiles',
    audience_json: JSON.stringify({ all_customers: true }),
    reasoning: 'Personalized recommendations drive 2x engagement.',
    recommended_send_time: 'evening',
    recommended_channels: 'whatsapp,email,rcs',
    offer_strategy: 'no discount — curiosity-driven discovery',
    message_variants_json: JSON.stringify([{ channel: 'whatsapp', template: 'New item alert! We think you\'ll love {item}, {name}.' }]),
    predicted_json: JSON.stringify({ trial_rate: 0.25, repeat_purchase_rate: 0.40 }),
    created_at: '2026-05-10T10:00:00.000Z',
  },
];

// ─── Messages & events for completed campaign ────────────────────────────────
function generateCompletedCampaignData(customers, dnas) {
  const campaignId = 'camp_menu_completed';
  const LAUNCH_TIME = new Date('2026-05-15T18:00:00.000Z');

  // Pick ~480 customers for the completed campaign
  const targetCustomers = customers.filter((_, i) => i % 2 === 0 || rand() < 0.9).slice(0, 480);

  const messages = [];
  const events = [];

  for (const cust of targetCustomers) {
    const dna = dnas.find(d => d.customer_id === cust.customer_id);
    const channel = dna ? dna.preferred_channel : 'whatsapp';
    const offerId = dna && dna.churn_risk_score >= 0.6
      ? 'offer_high_15'
      : dna && dna.churn_risk_score >= 0.35
        ? 'offer_medium_10'
        : 'offer_loyal_points';

    const msgId = did();
    const sentAt = new Date(LAUNCH_TIME.getTime() + randInt(0, 3600000)).toISOString();

    // Determine final status of the message
    const r = rand();
    let current_status;
    if (r < 0.03) current_status = 'failed';
    else if (r < 0.05) current_status = 'sent_after_retry';
    else if (r < 0.30) current_status = 'delivered';
    else if (r < 0.60) current_status = 'read';
    else if (r < 0.75) current_status = 'clicked';
    else if (r < 0.85) current_status = 'order_created';
    else current_status = 'sent';

    messages.push({
      message_id: msgId,
      campaign_id: campaignId,
      customer_id: cust.customer_id,
      channel,
      offer_tier: offerId === 'offer_loyal_points' ? 'loyal' : offerId === 'offer_medium_10' ? 'medium' : 'high',
      offer_id: offerId,
      rendered_message: `Hey ${cust.first_name}, check out our new menu items! Use code NEWMENU for your offer.`,
      current_status,
      created_at: LAUNCH_TIME.toISOString(),
      sent_at: sentAt,
    });

    // Generate communication events for this message
    const eventBase = { message_id: msgId, campaign_id: campaignId, customer_id: cust.customer_id, channel };

    // sent event always
    const sentEventTime = sentAt;
    events.push({
      event_id: did(),
      ...eventBase,
      event_type: 'sent',
      event_time: sentEventTime,
      received_at: sentEventTime,
      metadata_json: JSON.stringify({ provider: 'kaleyra' }),
      duplicate: 0,
    });

    if (current_status === 'failed') {
      events.push({
        event_id: did(),
        ...eventBase,
        event_type: 'failed',
        event_time: new Date(new Date(sentAt).getTime() + 60000).toISOString(),
        received_at: new Date(new Date(sentAt).getTime() + 60000).toISOString(),
        metadata_json: JSON.stringify({ error_code: 'delivery_timeout' }),
        duplicate: 0,
      });
      continue;
    }

    if (current_status === 'sent_after_retry') {
      const retryTime = new Date(new Date(sentAt).getTime() + 120000).toISOString();
      events.push({
        event_id: did(),
        ...eventBase,
        event_type: 'retry_scheduled',
        event_time: retryTime,
        received_at: retryTime,
        metadata_json: JSON.stringify({ attempt: 1 }),
        duplicate: 0,
      });
      const retrySuccessTime = new Date(new Date(sentAt).getTime() + 300000).toISOString();
      events.push({
        event_id: did(),
        ...eventBase,
        event_type: 'sent_after_retry',
        event_time: retrySuccessTime,
        received_at: retrySuccessTime,
        metadata_json: JSON.stringify({ attempt: 2 }),
        duplicate: 0,
      });
    }

    // delivered
    const deliveredTime = new Date(new Date(sentAt).getTime() + randInt(30000, 180000)).toISOString();
    events.push({
      event_id: did(),
      ...eventBase,
      event_type: 'delivered',
      event_time: deliveredTime,
      received_at: deliveredTime,
      metadata_json: JSON.stringify({ network: 'jio' }),
      duplicate: 0,
    });

    if (['delivered'].includes(current_status)) continue;

    // read
    const readTime = new Date(new Date(deliveredTime).getTime() + randInt(60000, 1800000)).toISOString();
    events.push({
      event_id: did(),
      ...eventBase,
      event_type: 'read',
      event_time: readTime,
      received_at: readTime,
      metadata_json: JSON.stringify({}),
      duplicate: 0,
    });

    if (['read'].includes(current_status)) continue;

    // clicked
    const clickTime = new Date(new Date(readTime).getTime() + randInt(10000, 300000)).toISOString();
    events.push({
      event_id: did(),
      ...eventBase,
      event_type: 'clicked',
      event_time: clickTime,
      received_at: clickTime,
      metadata_json: JSON.stringify({ cta: 'order_now' }),
      duplicate: 0,
    });

    // Add a duplicate click occasionally (5%)
    if (rand() < 0.05) {
      events.push({
        event_id: did(),
        ...eventBase,
        event_type: 'clicked',
        event_time: clickTime,
        received_at: new Date(new Date(clickTime).getTime() + 1000).toISOString(),
        metadata_json: JSON.stringify({ cta: 'order_now', duplicate_flag: true }),
        duplicate: 1,
      });
    }

    if (['clicked'].includes(current_status)) continue;

    // order_created
    const orderTime = new Date(new Date(clickTime).getTime() + randInt(60000, 600000)).toISOString();
    events.push({
      event_id: did(),
      ...eventBase,
      event_type: 'order_created',
      event_time: orderTime,
      received_at: orderTime,
      metadata_json: JSON.stringify({ order_value: randInt(250, 600) }),
      duplicate: 0,
    });
  }

  return { messages, events };
}

// ─── Main seed function ───────────────────────────────────────────────────────
async function seed() {
  const db = await getDb();
  console.log('[seed] Starting deterministic seed (seed=42)...');

  // Clear all tables (idempotent)
  const tables = [
    'communication_events','messages','campaigns','craving_dna',
    'order_items','orders','customers','menu_items','stores','offers','plays'
  ];
  for (const t of tables) await db.run(`DELETE FROM ${t}`);
  console.log('[seed] Cleared existing data.');

  // 1. Stores
  for (const s of STORES) {
    await db.run(`INSERT INTO stores (store_id, name, city) VALUES (?,?,?)`, [s.store_id, s.name, s.city]);
  }
  console.log(`[seed] ✅ Inserted ${STORES.length} stores.`);

  // 2. Menu items
  for (const m of MENU_ITEMS) {
    await db.run(`INSERT INTO menu_items (sku, name, category, price) VALUES (?,?,?,?)`, [m.sku, m.name, m.category, m.price]);
  }
  console.log(`[seed] ✅ Inserted ${MENU_ITEMS.length} menu items.`);

  // 3. Offers
  for (const o of OFFERS) {
    await db.run(`INSERT INTO offers (offer_id, offer_tier, offer_type, value, description, expires_at) VALUES (?,?,?,?,?,?)`,
      [o.offer_id, o.offer_tier, o.offer_type, o.value, o.description, o.expires_at]);
  }
  console.log(`[seed] ✅ Inserted ${OFFERS.length} offers.`);

  // 4. Plays
  for (const p of PLAYS) {
    await db.run(`INSERT INTO plays (play_id, play_name, objective, goal_text, audience_json, reasoning, recommended_send_time, recommended_channels, offer_strategy, message_variants_json, predicted_json, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [p.play_id, p.play_name, p.objective, p.goal_text, p.audience_json, p.reasoning, p.recommended_send_time, p.recommended_channels, p.offer_strategy, p.message_variants_json, p.predicted_json, p.created_at]);
  }
  console.log(`[seed] ✅ Inserted ${PLAYS.length} plays.`);

  // 5. Customers (500)
  console.log('[seed] Generating 500 customers...');
  const customers = generateCustomers(500);
  for (const c of customers) {
    await db.run(
      `INSERT INTO customers (customer_id, first_name, last_name, phone, email, city, preferred_store_id, loyalty_tier, points_balance, app_user, whatsapp_opt_in, sms_opt_in, email_opt_in, rcs_opt_in, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [c.customer_id, c.first_name, c.last_name, c.phone, c.email, c.city, c.preferred_store_id, c.loyalty_tier, c.points_balance, c.app_user, c.whatsapp_opt_in, c.sms_opt_in, c.email_opt_in, c.rcs_opt_in, c.created_at]
    );
  }
  console.log(`[seed] ✅ Inserted ${customers.length} customers.`);

  // 6. Orders & order_items (~3000)
  console.log('[seed] Generating ~3000 orders...');
  const { allOrders, allItems } = generateOrders(customers);
  for (const o of allOrders) {
    await db.run(
      `INSERT INTO orders (order_id, customer_id, store_id, order_time, order_channel, fulfillment_type, meal_period, order_value, discount_used, attributed_campaign_id, attribution_source) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [o.order_id, o.customer_id, o.store_id, o.order_time, o.order_channel, o.fulfillment_type, o.meal_period, o.order_value, o.discount_used, o.attributed_campaign_id, o.attribution_source]
    );
  }
  for (const it of allItems) {
    await db.run(
      `INSERT INTO order_items (order_item_id, order_id, sku, item_name, category, quantity, unit_price) VALUES (?,?,?,?,?,?,?)`,
      [it.order_item_id, it.order_id, it.sku, it.item_name, it.category, it.quantity, it.unit_price]
    );
  }
  console.log(`[seed] ✅ Inserted ${allOrders.length} orders, ${allItems.length} order items.`);

  // 7. Craving DNA
  console.log('[seed] Computing craving_dna for all customers...');
  const dnas = computeCravingDna(customers, allOrders, allItems);
  for (const d of dnas) {
    await db.run(
      `INSERT INTO craving_dna (customer_id, favorite_category, favorite_item, usual_meal_period, usual_order_hour, days_since_last_order, normal_order_gap_days, order_rhythm_multiplier, discount_sensitivity, preferred_channel, whatsapp_engagement_score, sms_engagement_score, email_engagement_score, rcs_engagement_score, max_channel_engagement_score, churn_risk_score, predicted_next_best_play, computed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.customer_id, d.favorite_category, d.favorite_item, d.usual_meal_period, d.usual_order_hour, d.days_since_last_order, d.normal_order_gap_days, d.order_rhythm_multiplier, d.discount_sensitivity, d.preferred_channel, d.whatsapp_engagement_score, d.sms_engagement_score, d.email_engagement_score, d.rcs_engagement_score, d.max_channel_engagement_score, d.churn_risk_score, d.predicted_next_best_play, d.computed_at]
    );
  }
  console.log(`[seed] ✅ Inserted ${dnas.length} craving_dna rows.`);

  // 8. Campaigns
  for (const c of CAMPAIGNS) {
    await db.run(
      `INSERT INTO campaigns (campaign_id, play_id, campaign_name, objective, status, segment_rules_json, reasoning, recommended_send_time, predicted_metrics_json, created_at, launched_at, completed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [c.campaign_id, c.play_id, c.campaign_name, c.objective, c.status, c.segment_rules_json, c.reasoning, c.recommended_send_time, c.predicted_metrics_json, c.created_at, c.launched_at, c.completed_at]
    );
  }
  console.log(`[seed] ✅ Inserted ${CAMPAIGNS.length} campaigns.`);

  // 9. Messages & events for completed campaign
  console.log('[seed] Generating messages & communication_events for camp_menu_completed...');
  const { messages, events } = generateCompletedCampaignData(customers, dnas);
  for (const m of messages) {
    await db.run(
      `INSERT INTO messages (message_id, campaign_id, customer_id, channel, offer_tier, offer_id, rendered_message, current_status, created_at, sent_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [m.message_id, m.campaign_id, m.customer_id, m.channel, m.offer_tier, m.offer_id, m.rendered_message, m.current_status, m.created_at, m.sent_at]
    );
  }
  for (const e of events) {
    await db.run(
      `INSERT INTO communication_events (event_id, message_id, campaign_id, customer_id, channel, event_type, event_time, received_at, metadata_json, duplicate) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [e.event_id, e.message_id, e.campaign_id, e.customer_id, e.channel, e.event_type, e.event_time, e.received_at, e.metadata_json, e.duplicate]
    );
  }
  console.log(`[seed] ✅ Inserted ${messages.length} messages, ${events.length} communication_events.`);

  console.log('\n[seed] 🎉 Seed complete!');
  console.log(`       Customers:     ${customers.length}`);
  console.log(`       Orders:        ${allOrders.length}`);
  console.log(`       Order items:   ${allItems.length}`);
  console.log(`       Craving DNA:   ${dnas.length}`);
  console.log(`       Campaigns:     ${CAMPAIGNS.length}`);
  console.log(`       Messages:      ${messages.length}`);
  console.log(`       Comm events:   ${events.length}`);
}

seed().catch(err => {
  console.error('[seed] ❌ Error:', err.message);
  process.exit(1);
});
