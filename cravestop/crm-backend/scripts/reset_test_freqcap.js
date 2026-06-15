require('dotenv').config();
const { getDb } = require('./src/db/db');

(async () => {
  const db = await getDb();

  // Count recent events poisoning the frequency cap
  const recent = await db.get("SELECT COUNT(*) as cnt FROM communication_events WHERE sent_at > datetime('now', '-7 days')");
  console.log('Recent events within 7 days:', recent.cnt);

  // Get all test campaigns created today (not the 4 seeded ones)
  const seededIds = ['camp_spicy_comeback','camp_craving_clock','camp_store_heat','camp_streak_rescue','camp_menu_completed'];
  const allCamps = await db.all("SELECT campaign_id FROM campaigns");
  const testCamps = allCamps.filter(c => !seededIds.includes(c.campaign_id));
  console.log('Test campaign count to clear:', testCamps.length);

  // Clear communication_events for test campaigns so freq cap resets
  for (const camp of testCamps) {
    const del = await db.run('DELETE FROM communication_events WHERE campaign_id = ?', [camp.campaign_id]);
    if (del.changes > 0) console.log('  Cleared', del.changes, 'events for', camp.campaign_id);
  }

  // Verify
  const after = await db.get("SELECT COUNT(*) as cnt FROM communication_events WHERE sent_at > datetime('now', '-7 days')");
  console.log('Recent events after cleanup:', after.cnt);

  const spicy = await db.get("SELECT COUNT(*) as cnt FROM craving_dna d JOIN customers c ON c.customer_id = d.customer_id WHERE d.favorite_category = 'spicy' AND d.days_since_last_order >= 14 AND (c.whatsapp_opt_in = 1 OR c.sms_opt_in = 1)");
  console.log('Spicy dormant eligible pool:', spicy.cnt);

  process.exit(0);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
