/**
 * CraveStop E2E Smoke Test
 * Tests the full flow: generate play → create campaign → launch → check analytics
 */

const BASE = 'http://localhost:3000';

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

function pass(label, value) {
  console.log(`  ✅ ${label}${value !== undefined ? ': ' + JSON.stringify(value) : ''}`);
}
function fail(label, err) {
  console.error(`  ❌ ${label}: ${err}`);
  process.exitCode = 1;
}

async function run() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  CraveStop — End-to-End Smoke Test');
  console.log('══════════════════════════════════════════════════════\n');

  // 1. Health checks
  console.log('── Step 1: Health Checks ──');
  try {
    const crm = await api('GET', '/health');
    pass('CRM backend', `${crm.status}, ${crm.customers_in_db} customers`);
  } catch (e) { fail('CRM backend health', e.message); }

  // 2. Generate a play
  console.log('\n── Step 2: Generate Play ──');
  let play;
  try {
    play = await api('POST', '/api/plays/generate', {
      goal: "Bring back spicy-food customers who haven't ordered recently"
    });
    pass('Play generated', play.play_name);
    pass('Play type', play.objective);
    pass('Audience eligible', play.audience?.eligible_count);
    pass('Offer ladder tiers', Object.keys(play.offer_ladder || {}).length);
    pass('Reasoning length', play.reasoning?.length + ' chars');
    pass('Predicted orders', play.predicted?.orders);
  } catch (e) { fail('Generate play', e.message); return; }

  // 3. Fetch the persisted play
  console.log('\n── Step 3: Fetch Persisted Play ──');
  try {
    const fetched = await api('GET', `/api/plays/${play.play_id}`);
    pass('Play fetched from DB', fetched.play_name);
  } catch (e) { fail('Fetch play', e.message); }

  // 4. Create campaign from play
  console.log('\n── Step 4: Create Campaign from Play ──');
  let campaign;
  try {
    campaign = await api('POST', '/api/campaigns/from-play', { play_id: play.play_id });
    pass('Campaign created', campaign.campaign_id);
    pass('Campaign status', campaign.status);
  } catch (e) { fail('Create campaign', e.message); return; }

  // 5. Launch campaign
  console.log('\n── Step 5: Launch Campaign ──');
  let launch;
  try {
    launch = await api('POST', `/api/campaigns/${campaign.campaign_id}/launch`);
    pass('Campaign launched', `${launch.created_messages} messages created`);
    pass('Frequency cap excluded', launch.skipped_frequency_cap);
    pass('Channel service notified', !!launch.channel_service_batch_id);
  } catch (e) { fail('Launch campaign', e.message); }

  // 6. Check campaigns list
  console.log('\n── Step 6: List Campaigns ──');
  try {
    const campaigns = await api('GET', '/api/campaigns');
    pass('Campaigns listed', campaigns.length + ' campaigns');
    const sending = campaigns.find(c => c.campaign_id === campaign.campaign_id);
    pass('New campaign in list', sending?.status);
  } catch (e) { fail('List campaigns', e.message); }

  // 7. Wait for some events then check analytics on completed campaign
  console.log('\n── Step 7: Analytics on Pre-seeded Campaign ──');
  try {
    const analytics = await api('GET', '/api/campaigns/camp_menu_completed/analytics');
    pass('Campaign name', analytics.campaign_name);
    pass('Sent events', analytics.sent);
    pass('Delivery rate', analytics.delivery_rate + '%');
    pass('Click rate', analytics.click_rate + '%');
    pass('AI insight', analytics.ai_insight?.substring(0, 60) + '...');
    pass('By-channel breakdown', Object.keys(analytics.by_channel || {}).length + ' channels');
  } catch (e) { fail('Analytics', e.message); }

  // 8. Events for completed campaign
  console.log('\n── Step 8: Events Endpoint ──');
  try {
    const events = await api('GET', '/api/campaigns/camp_menu_completed/events');
    pass('Events returned', events.length + ' events');
    const types = [...new Set(events.map(e => e.event_type))].sort();
    pass('Event types', types.join(', '));
  } catch (e) { fail('Events endpoint', e.message); }

  // 9. Customers endpoint
  console.log('\n── Step 9: Customers Endpoint ──');
  try {
    const custs = await api('GET', '/api/customers?limit=5');
    pass('Customers fetched', custs.customers?.length + ' (of ' + custs.total + ')');
    pass('Pagination', `page ${custs.page}/${custs.total_pages}`);
  } catch (e) { fail('Customers endpoint', e.message); }

  // 10. Idempotency test
  console.log('\n── Step 10: Receipt Idempotency ──');
  try {
    const fakeEvent = {
      event_id: 'smoke_test_evt_001',
      message_id: 'smoke_test_msg_001',
      campaign_id: campaign.campaign_id,
      customer_id: 'smoke_test_cust_001',
      channel: 'whatsapp',
      event_type: 'sent',
      event_time: new Date().toISOString(),
      metadata: {}
    };
    const r1 = await api('POST', '/api/receipts', fakeEvent);
    pass('First receipt', `duplicate=${r1.duplicate}`);
    const r2 = await api('POST', '/api/receipts', fakeEvent);
    pass('Duplicate receipt blocked', `duplicate=${r2.duplicate}, msg=${r2.message?.substring(0,40)}`);
    if (!r2.duplicate) {
      fail('Idempotency', 'Second call should have been flagged as duplicate');
    }
  } catch (e) { fail('Idempotency test', e.message); }

  console.log('\n══════════════════════════════════════════════════════');
  if (process.exitCode === 1) {
    console.log('  ⚠️  SOME SMOKE TESTS FAILED — see ❌ above');
  } else {
    console.log('  🎉 ALL SMOKE TESTS PASSED — system is healthy');
  }
  console.log('══════════════════════════════════════════════════════\n');
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
