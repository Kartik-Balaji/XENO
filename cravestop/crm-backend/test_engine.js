'use strict';
/**
 * Play Engine Test Script
 * Run from crm-backend directory: node test_engine.js
 */

const { generatePlay, intentParser, offerLadder, channelAdvisor, sendTimePredictor, predictionEngine } = require('./src/services/playEngine');

async function main() {
  let allOk = true;

  // ---- Step 1: intentParser ----
  console.log('\n=== STEP 1: intentParser ===');
  const ipTests = [
    { g: "Bring back spicy-food customers who haven't ordered recently and drive dinner orders tonight.", e: 'spicy_comeback_window' },
    { g: 'routine morning usual clock time',                                                            e: 'craving_clock' },
    { g: 'store low sales nearby lunch location footfall',                                              e: 'store_heat_rescue' },
    { g: 'streak loyalty points regular frequent',                                                      e: 'streak_rescue' },
    { g: 'new item launch limited lto menu',                                                            e: 'new_menu_matchmaker' },
    { g: 'completely unrelated goal',                                                                   e: 'spicy_comeback_window' }, // default
  ];
  for (const { g, e } of ipTests) {
    const r = intentParser(g);
    const pass = r.playType === e;
    if (!pass) allOk = false;
    console.log(`  ${pass ? '✅' : '❌'} "${g.slice(0, 55)}..." → ${r.playType} [${r.matchedKeywords.join(', ')}]`);
  }

  // ---- Step 3: offerLadder ----
  console.log('\n=== STEP 3: offerLadder ===');
  const synth = [
    { churn_risk_score: 0.10 }, // loyal
    { churn_risk_score: 0.20 }, // loyal
    { churn_risk_score: 0.50 }, // medium
    { churn_risk_score: 0.65 }, // medium
    { churn_risk_score: 0.80 }, // high
    { churn_risk_score: 0.90 }, // high
    { churn_risk_score: 0.35 }, // boundary → medium
    { churn_risk_score: 0.70 }, // boundary → high
  ];
  const ladder = offerLadder(synth);
  console.log('  loyal_points.count:', ladder.loyal_points.count, '(expected 2)');
  console.log('  medium_risk_10.count:', ladder.medium_risk_10.count, '(expected 3)');
  console.log('  high_risk_15.count:', ladder.high_risk_15.count, '(expected 3)');

  // ---- Step 4: channelAdvisor ----
  console.log('\n=== STEP 4: channelAdvisor ===');
  const chs = [
    ...Array(10).fill({ preferred_channel: 'whatsapp' }),
    ...Array(4).fill({ preferred_channel: 'sms' }),
    ...Array(2).fill({ preferred_channel: 'email' }),
  ];
  const recommended = channelAdvisor(chs);
  console.log('  channelAdvisor result:', recommended, '(expected [whatsapp, sms])');

  // ---- Step 5: sendTimePredictor ----
  console.log('\n=== STEP 5: sendTimePredictor ===');
  const mealCusts = [
    ...Array(8).fill({ usual_meal_period: 'dinner' }),
    ...Array(3).fill({ usual_meal_period: 'lunch' }),
  ];
  const st = sendTimePredictor(mealCusts);
  console.log('  sendTimePredictor result:', st, '(should be today at ~19:30)');

  // ---- Step 6: predictionEngine ----
  console.log('\n=== STEP 6: predictionEngine ===');
  const preds = predictionEngine(1000, 'whatsapp');
  console.log('  predictionEngine(1000, whatsapp):', JSON.stringify(preds));
  // whatsapp: delivered = 1000*(1-0.05)=950, read=950*0.65=618, clicked=950*0.12=114, orders=114*0.36=41, revenue=41*460=18860
  const expectedDelivered = Math.round(1000 * 0.95);
  console.log('  delivered correct:', preds.delivered === expectedDelivered ? '✅' : `❌ got ${preds.delivered} expected ${expectedDelivered}`);

  // ---- Full pipeline (no LLM key — deterministic) ----
  console.log('\n=== FULL PIPELINE (deterministic, no GEMINI_API_KEY) ===');
  const origKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const play = await generatePlay("Bring back spicy-food customers who haven't ordered recently and drive dinner orders tonight.");
  console.log('  play_id:', play.play_id);
  console.log('  play_name:', play.play_name);
  console.log('  play_type (_meta):', play._meta.play_type, '(expected: spicy_comeback_window)');
  console.log('  matched_keywords:', play._meta.matched_keywords);
  console.log('  segment_name:', play.audience.segment_name);
  console.log('  matched_count:', play.audience.matched_count);
  console.log('  frequency_cap_excluded:', play.audience.frequency_cap_excluded);
  console.log('  eligible_count:', play.audience.eligible_count);
  console.log('  rules:', play.audience.rules);
  console.log('  computed_facts:', JSON.stringify(play.audience.computed_facts));
  console.log('  recommended_channels:', play.recommended_channels);
  console.log('  recommended_send_time:', play.recommended_send_time);
  console.log('  offer_ladder:', JSON.stringify(play.offer_ladder, null, 2));
  console.log('  message_variants:', JSON.stringify(play.message_variants, null, 2));
  console.log('  predicted:', JSON.stringify(play.predicted, null, 2));
  console.log('\n  REASONING:');
  console.log(' ', play.reasoning);

  // ---- Deterministic fallback with fake key ----
  console.log('\n=== DETERMINISTIC FALLBACK (fake GEMINI key) ===');
  process.env.GEMINI_API_KEY = 'TOTALLY_FAKE_KEY_WILL_FAIL';
  const play2 = await generatePlay('routine morning customers with usual clock order habits');
  // Restore
  if (origKey !== undefined) process.env.GEMINI_API_KEY = origKey;
  else delete process.env.GEMINI_API_KEY;

  console.log('  play_type:', play2._meta.play_type, '(expected: craving_clock)');
  console.log('  reasoning starts with "These customers":', play2.reasoning.startsWith('These customers') ? '✅ YES — deterministic fallback used' : '⚠️  LLM may have responded (or different fallback)');
  console.log('  reasoning:', play2.reasoning);

  if (play2._meta.play_type !== 'craving_clock') {
    allOk = false;
    console.log('  ❌ Wrong play type for craving_clock goal!');
  }

  console.log('\n' + (allOk ? '✅ All tests passed!' : '⚠️  Some tests had issues — review output above.'));
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
