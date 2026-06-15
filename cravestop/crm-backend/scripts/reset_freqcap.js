'use strict';
// Run from crm-backend dir: node scripts/reset_freqcap.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', 'cravestop.db');
const SEEDED_CAMPAIGN_IDS = [
  'camp_spicy_comeback',
  'camp_craving_clock',
  'camp_store_heat',
  'camp_streak_rescue',
  'camp_menu_completed',
];

(async () => {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  const before = await db.get(
    "SELECT COUNT(*) as cnt FROM communication_events WHERE event_time > datetime('now', '-7 days')"
  );
  console.log('Events in 7-day freq-cap window (before):', before.cnt);

  const allCamps = await db.all('SELECT campaign_id FROM campaigns');
  const testCamps = allCamps.filter(c => !SEEDED_CAMPAIGN_IDS.includes(c.campaign_id));
  console.log('Non-seeded campaigns found:', testCamps.length);

  let totalDeleted = 0;
  for (const { campaign_id } of testCamps) {
    const r = await db.run('DELETE FROM communication_events WHERE campaign_id = ?', [campaign_id]);
    totalDeleted += r.changes;
    if (r.changes > 0) console.log(`  Cleared ${r.changes} events -> ${campaign_id}`);
  }
  console.log('Total events deleted:', totalDeleted);

  const after = await db.get(
    "SELECT COUNT(*) as cnt FROM communication_events WHERE event_time > datetime('now', '-7 days')"
  );
  console.log('Events in 7-day window (after):', after.cnt);

  const spicy = await db.get(
    "SELECT COUNT(*) as cnt FROM craving_dna d " +
    "JOIN customers c ON c.customer_id = d.customer_id " +
    "WHERE d.favorite_category = 'spicy' AND d.days_since_last_order >= 14 " +
    "AND (c.whatsapp_opt_in = 1 OR c.sms_opt_in = 1)"
  );
  console.log('\nSpicy dormant pool size:', spicy.cnt);
  console.log('These will now be eligible when you generate a Spicy Comeback play!');

  await db.close();
  console.log('\nDone. Restart the backend to pick up Groq changes.');
})().catch(e => { console.error('Error:', e.message); process.exit(1); });
