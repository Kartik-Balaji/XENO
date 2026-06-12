/**
 * channelConfig.js
 * ----------------
 * Channel probability table for CraveStop channel simulation service.
 * All timing values are in milliseconds. Rates are fractions (0–1).
 */

const CHANNEL_CONFIG = {
  whatsapp: {
    failure_rate: 0.05,
    delivery_delay_ms: { min: 500, max: 2000 },
    read_rate: 0.65,
    read_delay_ms: { min: 3000, max: 8000 },
    click_rate: 0.12,
    click_delay_ms: { min: 1000, max: 5000 },
    retry_on_fail: true,
    retry_rate: 0.50,
    retry_delay_ms: 2000,
    retry_success_rate: 0.70,
    order_after_click: 0.36,
  },

  sms: {
    failure_rate: 0.08,
    delivery_delay_ms: { min: 500, max: 1500 },
    read_rate: 0,           // No read events for SMS
    read_delay_ms: null,
    click_rate: 0.06,
    click_delay_ms: { min: 2000, max: 8000 }, // after delivery (no read for SMS)
    retry_on_fail: true,
    retry_rate: 0.40,
    retry_delay_ms: 2000,
    retry_success_rate: 0.60,
    order_after_click: 0.22,
  },

  email: {
    failure_rate: 0.03,
    delivery_delay_ms: { min: 1000, max: 3000 },
    read_rate: 0.35,
    read_delay_ms: { min: 5000, max: 15000 },
    click_rate: 0.04,
    click_delay_ms: { min: 2000, max: 10000 },
    retry_on_fail: false,
    retry_rate: 0,
    retry_delay_ms: null,
    retry_success_rate: 0,
    order_after_click: 0.18,
  },

  rcs: {
    failure_rate: 0.07,
    delivery_delay_ms: { min: 500, max: 2500 },
    read_rate: 0.50,
    read_delay_ms: { min: 3000, max: 10000 },
    click_rate: 0.10,
    click_delay_ms: { min: 1000, max: 5000 },
    retry_on_fail: true,
    retry_rate: 0.50,
    retry_delay_ms: 2000,
    retry_success_rate: 0.65,
    order_after_click: 0.30,
  },
};

/**
 * Retrieve config for a channel (case-insensitive).
 * Throws if the channel is unknown.
 */
function getChannelConfig(channel) {
  const key = (channel || '').toLowerCase();
  const config = CHANNEL_CONFIG[key];
  if (!config) {
    throw new Error(
      `Unknown channel: "${channel}". Supported channels: ${Object.keys(CHANNEL_CONFIG).join(', ')}`
    );
  }
  return config;
}

module.exports = { CHANNEL_CONFIG, getChannelConfig };
