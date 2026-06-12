-- CraveStop Mini-CRM Schema
-- All tables for the CRM backend

CREATE TABLE IF NOT EXISTS customers (
  customer_id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  preferred_store_id TEXT,
  loyalty_tier TEXT,
  points_balance INTEGER,
  app_user BOOLEAN,
  whatsapp_opt_in BOOLEAN,
  sms_opt_in BOOLEAN,
  email_opt_in BOOLEAN,
  rcs_opt_in BOOLEAN,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  customer_id TEXT,
  store_id TEXT,
  order_time TEXT,
  order_channel TEXT,
  fulfillment_type TEXT,
  meal_period TEXT,
  order_value REAL,
  discount_used REAL,
  attributed_campaign_id TEXT,
  attribution_source TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id TEXT PRIMARY KEY,
  order_id TEXT,
  sku TEXT,
  item_name TEXT,
  category TEXT,
  quantity INTEGER,
  unit_price REAL
);

CREATE TABLE IF NOT EXISTS menu_items (
  sku TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  price REAL
);

CREATE TABLE IF NOT EXISTS stores (
  store_id TEXT PRIMARY KEY,
  name TEXT,
  city TEXT
);

CREATE TABLE IF NOT EXISTS craving_dna (
  customer_id TEXT PRIMARY KEY,
  favorite_category TEXT,
  favorite_item TEXT,
  usual_meal_period TEXT,
  usual_order_hour INTEGER,
  days_since_last_order INTEGER,
  normal_order_gap_days INTEGER,
  order_rhythm_multiplier REAL,
  discount_sensitivity TEXT,
  preferred_channel TEXT,
  whatsapp_engagement_score REAL,
  sms_engagement_score REAL,
  email_engagement_score REAL,
  rcs_engagement_score REAL,
  max_channel_engagement_score REAL,
  churn_risk_score REAL,
  predicted_next_best_play TEXT,
  computed_at TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
  campaign_id TEXT PRIMARY KEY,
  play_id TEXT,
  campaign_name TEXT,
  objective TEXT,
  status TEXT,
  segment_rules_json TEXT,
  reasoning TEXT,
  recommended_send_time TEXT,
  predicted_metrics_json TEXT,
  created_at TEXT,
  launched_at TEXT,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  message_id TEXT PRIMARY KEY,
  campaign_id TEXT,
  customer_id TEXT,
  channel TEXT,
  offer_tier TEXT,
  offer_id TEXT,
  rendered_message TEXT,
  current_status TEXT,
  created_at TEXT,
  sent_at TEXT
);

CREATE TABLE IF NOT EXISTS communication_events (
  event_id TEXT PRIMARY KEY,
  message_id TEXT,
  campaign_id TEXT,
  customer_id TEXT,
  channel TEXT,
  event_type TEXT,
  event_time TEXT,
  received_at TEXT,
  metadata_json TEXT,
  duplicate INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS offers (
  offer_id TEXT PRIMARY KEY,
  offer_tier TEXT,
  offer_type TEXT,
  value REAL,
  description TEXT,
  expires_at TEXT
);

CREATE TABLE IF NOT EXISTS plays (
  play_id TEXT PRIMARY KEY,
  play_name TEXT,
  objective TEXT,
  goal_text TEXT,
  audience_json TEXT,
  reasoning TEXT,
  recommended_send_time TEXT,
  recommended_channels TEXT,
  offer_strategy TEXT,
  message_variants_json TEXT,
  predicted_json TEXT,
  created_at TEXT
);
