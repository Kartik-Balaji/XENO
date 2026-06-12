'use strict';

/**
 * CraveStop Mini-CRM — Verification Script
 * Run: node src/db/verify.js
 * Exits with code 0 if all checks pass, code 1 if any fail.
 */

const { getDb } = require('./db');

let allPassed = true;
const failures = [];

function check(label, value, condition, detail) {
  const passed = condition(value);
  const symbol = passed ? '✅' : '❌';
  if (!passed) {
    allPassed = false;
    failures.push(`FAIL: ${label} — ${detail || value}`);
  }
  console.log(`${symbol} ${label}: ${detail || value}`);
}

async function verify() {
  const db = await getDb();

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  CraveStop Mini-CRM — Database Verification Report');
  console.log('════════════════════════════════════════════════════════\n');

  // ── 1. Total customer count ──────────────────────────────────────────────────
  const custRow = await db.get('SELECT COUNT(*) as n FROM customers');
  const custCount = custRow.n;
  check('Total customers', custCount, v => v === 500, `${custCount} (expected 500)`);

  // ── 2. Customers by city ─────────────────────────────────────────────────────
  console.log('\n--- Customers by City ---');
  const byCityRaw = await db.all('SELECT city, COUNT(*) as n FROM customers GROUP BY city ORDER BY n DESC');
  const cityMap = {};
  for (const r of byCityRaw) cityMap[r.city] = r.n;
  const expectedCities = ['Delhi','Mumbai','Bengaluru','Hyderabad','Pune'];
  for (const city of expectedCities) {
    const n = cityMap[city] || 0;
    const pct = Math.round(n / custCount * 100);
    console.log(`  ${city}: ${n} (${pct}%)`);
  }
  check('All 5 cities present', Object.keys(cityMap).length,
    v => v === 5, `${Object.keys(cityMap).length} cities found`);

  // ── 3. Customers by favorite_category ───────────────────────────────────────
  console.log('\n--- Customers by Favorite Category (from craving_dna) ---');
  const byCatRaw = await db.all('SELECT favorite_category, COUNT(*) as n FROM craving_dna GROUP BY favorite_category ORDER BY n DESC');
  for (const r of byCatRaw) {
    const pct = Math.round(r.n / custCount * 100);
    console.log(`  ${r.favorite_category}: ${r.n} (${pct}%)`);
  }
  check('Favorite categories populated', byCatRaw.length, v => v >= 3, `${byCatRaw.length} categories`);

  // ── 4. Customers by loyalty_tier ─────────────────────────────────────────────
  console.log('\n--- Customers by Loyalty Tier ---');
  const byTierRaw = await db.all('SELECT loyalty_tier, COUNT(*) as n FROM customers GROUP BY loyalty_tier ORDER BY n DESC');
  for (const r of byTierRaw) {
    const pct = Math.round(r.n / custCount * 100);
    console.log(`  ${r.loyalty_tier}: ${r.n} (${pct}%)`);
  }
  check('All 4 loyalty tiers present', byTierRaw.length, v => v === 4, `${byTierRaw.length} tiers`);

  // ── 5. Customers by preferred_channel (from craving_dna) ─────────────────────
  console.log('\n--- Customers by Preferred Channel (from craving_dna) ---');
  const byChannelRaw = await db.all('SELECT preferred_channel, COUNT(*) as n FROM craving_dna GROUP BY preferred_channel ORDER BY n DESC');
  for (const r of byChannelRaw) {
    const pct = Math.round(r.n / custCount * 100);
    console.log(`  ${r.preferred_channel}: ${r.n} (${pct}%)`);
  }
  check('At least 3 channels present', byChannelRaw.length, v => v >= 3, `${byChannelRaw.length} channels`);

  // ── 6. Total order count ─────────────────────────────────────────────────────
  console.log('\n--- Orders ---');
  const orderRow = await db.get('SELECT COUNT(*) as n FROM orders');
  const orderCount = orderRow.n;
  check('Total orders ~3000', orderCount,
    v => v >= 2500 && v <= 4000, `${orderCount} (expected ~3000)`);

  const itemRow = await db.get('SELECT COUNT(*) as n FROM order_items');
  check('Total order items present', itemRow.n, v => v >= 2500, `${itemRow.n} order items`);

  const avgOrders = (orderCount / custCount).toFixed(1);
  console.log(`  Average orders per customer: ${avgOrders}`);

  // ── 7. Craving DNA row count ─────────────────────────────────────────────────
  console.log('\n--- Craving DNA ---');
  const dnaRow = await db.get('SELECT COUNT(*) as n FROM craving_dna');
  const dnaCount = dnaRow.n;
  check('Craving DNA rows', dnaCount, v => v === 500, `${dnaCount} (expected 500)`);

  const nullChurn = (await db.get("SELECT COUNT(*) as n FROM craving_dna WHERE churn_risk_score IS NULL")).n;
  check('No null churn_risk_score', nullChurn, v => v === 0, `${nullChurn} nulls (expected 0)`);

  const nullFavCat = (await db.get("SELECT COUNT(*) as n FROM craving_dna WHERE favorite_category IS NULL")).n;
  check('No null favorite_category', nullFavCat, v => v === 0, `${nullFavCat} nulls (expected 0)`);

  // ── 8. Campaigns ─────────────────────────────────────────────────────────────
  console.log('\n--- Campaigns ---');
  const campRows = await db.all('SELECT campaign_id, campaign_name, status FROM campaigns ORDER BY status');
  check('Total campaigns', campRows.length, v => v === 4, `${campRows.length} (expected 4)`);
  for (const c of campRows) console.log(`  [${c.status.toUpperCase()}] ${c.campaign_name} (${c.campaign_id})`);
  const statuses = campRows.map(c => c.status).sort();
  const expectedStatuses = ['completed','draft','scheduled','sending'];
  check('All 4 statuses present', statuses.join(','),
    v => v === expectedStatuses.join(','), statuses.join(', '));

  // ── 9. Communication events for completed campaign ───────────────────────────
  console.log('\n--- Communication Events (camp_menu_completed) ---');
  const evtRow = await db.get("SELECT COUNT(*) as n FROM communication_events WHERE campaign_id = 'camp_menu_completed'");
  check('Events for completed campaign ≥ 1000', evtRow.n, v => v >= 1000, `${evtRow.n} events`);

  const evtByType = await db.all("SELECT event_type, COUNT(*) as n FROM communication_events WHERE campaign_id = 'camp_menu_completed' GROUP BY event_type ORDER BY n DESC");
  console.log('  Event type breakdown:');
  for (const e of evtByType) console.log(`    ${e.event_type}: ${e.n}`);

  const msgRow = await db.get("SELECT COUNT(*) as n FROM messages WHERE campaign_id = 'camp_menu_completed'");
  check('Messages for completed campaign ≥ 400', msgRow.n, v => v >= 400, `${msgRow.n} messages`);

  // ── 10. Stores ────────────────────────────────────────────────────────────────
  console.log('\n--- Stores ---');
  const storeRows = await db.all('SELECT store_id, name, city FROM stores');
  check('Total stores', storeRows.length, v => v === 5, `${storeRows.length} (expected 5)`);

  // ── 11. Menu items ────────────────────────────────────────────────────────────
  const menuRow = await db.get('SELECT COUNT(*) as n FROM menu_items');
  check('Menu items ≥ 20', menuRow.n, v => v >= 20, `${menuRow.n}`);

  // ── 12. Offers ────────────────────────────────────────────────────────────────
  const offerRow = await db.get('SELECT COUNT(*) as n FROM offers');
  check('Offers', offerRow.n, v => v === 3, `${offerRow.n} (expected 3)`);

  // ── 13. Churn risk distribution ───────────────────────────────────────────────
  console.log('\n--- Churn Risk Distribution ---');
  const churnLow  = (await db.get('SELECT COUNT(*) as n FROM craving_dna WHERE churn_risk_score < 0.35')).n;
  const churnMed  = (await db.get('SELECT COUNT(*) as n FROM craving_dna WHERE churn_risk_score >= 0.35 AND churn_risk_score < 0.60')).n;
  const churnHigh = (await db.get('SELECT COUNT(*) as n FROM craving_dna WHERE churn_risk_score >= 0.60')).n;
  console.log(`  Low (<0.35):    ${churnLow} (${Math.round(churnLow/custCount*100)}%)`);
  console.log(`  Medium (0.35–0.59): ${churnMed} (${Math.round(churnMed/custCount*100)}%)`);
  console.log(`  High (≥0.60):   ${churnHigh} (${Math.round(churnHigh/custCount*100)}%)`);
  check('Churn risk covers all bands', churnLow + churnMed + churnHigh,
    v => v === 500, `total ${churnLow + churnMed + churnHigh}`);

  // ── 14. Discount sensitivity ──────────────────────────────────────────────────
  console.log('\n--- Discount Sensitivity ---');
  const dsByType = await db.all('SELECT discount_sensitivity, COUNT(*) as n FROM craving_dna GROUP BY discount_sensitivity');
  for (const r of dsByType) {
    const pct = Math.round(r.n / custCount * 100);
    console.log(`  ${r.discount_sensitivity}: ${r.n} (${pct}%)`);
  }
  check('Discount sensitivity rows sum to 500', dsByType.reduce((s, r) => s + r.n, 0),
    v => v === 500, '');

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  if (allPassed) {
    console.log('  🎉 ALL CHECKS PASSED');
  } else {
    console.log('  ⚠️  SOME CHECKS FAILED:');
    for (const f of failures) console.log(`     ${f}`);
  }
  console.log('════════════════════════════════════════════════════════\n');

  process.exit(allPassed ? 0 : 1);
}

verify().catch(err => {
  console.error('[verify] ❌ Error:', err.message);
  process.exit(1);
});
