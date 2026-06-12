# CraveStop — Feature-Locked Agent Handoff

**Version:** V3 — Feature-Locked / Hero-Loop Final  
**Date:** 2026-06-10  
**Project:** Xeno Engineering Internship Assignment 2026  
**Product:** CraveStop  
**Metaphor:** Growth Kitchen  
**Demo brand:** UrbanBite, a fictional QSR / coffee-food chain  
**Primary demo play:** Spicy Comeback Window

---

## 0. Read this first

This file is the final narrowed handoff for another agent/builder. Do **not** expand CraveStop into a generic CRM. The product should win by executing one memorable, evaluator-aligned loop deeply:

> **AI proposes → marketer approves → channel delivers → AI learns.**

The submission should not feel like “many CRM modules.” It should feel like one complete, AI-native shopper engagement system built with strong product taste and strong systems thinking.

The four hero features are:

1. **AI Play Copilot** — goal in → executable campaign out.
2. **Offer Ladder Personalization** — one campaign, different incentives by customer risk/value.
3. **Visible Two-Service Send Monitor** — callback-driven delivery lifecycle shown live.
4. **Performance Kitchen AI Insight** — campaign ends with a learning and next action.

The supporting data layer is:

5. **Craving DNA** — computed customer features that make the AI reasoning feel real.

Everything else is secondary. Build only what supports these features.

---

## 1. Assignment interpretation

The Xeno assignment asks for an **AI-native Mini CRM for reaching shoppers**. It expects a product that can:

- ingest customers and orders,
- segment shoppers based on behavior and attributes,
- send personalized communications through a channel service,
- surface communication performance insights such as sent, delivered, failed, opened/read, clicked, and orders attributed to communication,
- use a separate stubbed channel service that asynchronously calls back into the CRM,
- demonstrate thoughtful handling of volume, ordering, retries, and failures,
- clearly explain what was built, what was intentionally not built, and what the scale tradeoffs are.

The assignment is **not** asking for a Salesforce-like CRM. Do not build leads, deals, tickets, support workflows, account pipelines, task boards, or customer success notes.

### Final interpretation

CraveStop is a **shopper engagement and repeat-revenue CRM** for QSR brands. It does not manage sales teams. It helps marketers decide:

> Who should we talk to, what should we say, what offer should we use, what channel should we send on, when should we send, and did the message actually drive an order?

---

## 2. External grounding and inspiration

Use this section only for framing in the README/video. Do not overclaim that CraveStop copies or represents any real brand.

### Xeno alignment

Xeno publicly positions itself around AI for retail loyalty, campaigns, offers, personalization, and measurable repeat revenue. Xeno’s site describes unifying loyalty, campaigns, and offers into autonomous AI that drives repeat revenue.  
Source: https://www.getxeno.com/

Xeno also has a public Taco Bell India case study around app downloads, personalized digital campaigns, and repeat-order lift. This supports choosing the QSR domain as a strong fit for the assignment.  
Source: https://www.getxeno.com/success-stories/taco-bell-xbox

### QSR trend alignment

Current QSR CRM/promotion themes strongly support CraveStop’s niche:

- structured value tiers instead of blanket discounting,
- app-exclusive offers,
- order-history personalization,
- limited-time offers as data capture,
- contextual promotions based on weather, location, and daypart,
- loyalty as a repeat-visit engine.

Useful source: https://www.talon.one/blog/qsr-promotions-strategy

### Design implication

CraveStop should not be a generic campaign form. It should be a QSR growth strategist that detects **craving moments** and turns them into executable plays.

---

## 3. Product thesis

### One-liner

**CraveStop is an AI-native CRM for QSR brands that turns shopper behavior into executable craving plays, sends personalized messages through simulated channels, and learns which nudges actually drove repeat orders.**

### Product promise

Instead of forcing marketers to manually assemble campaigns, CraveStop lets them type a business goal like:

> “Bring back spicy-food customers who haven’t ordered recently and drive dinner orders tonight.”

CraveStop responds with:

- a named growth play,
- a behavior-based audience,
- audience reasoning,
- an offer ladder,
- personalized message variants,
- channel and send-time recommendations,
- predicted campaign numbers,
- a launch path through the stubbed channel service,
- performance analytics and an AI learning after callbacks settle.

---

## 4. Product metaphor

### Product name

**CraveStop**

### Main workspace

**Growth Kitchen**

### Core object

**Growth Play**

A Growth Play is not just a campaign. It is a structured strategy object:

```json
{
  "play_id": "play_spicy_comeback_window",
  "play_name": "Spicy Comeback Window",
  "objective": "repeat_order_reactivation",
  "audience_strategy": "Dormant spicy loyalists who are past their usual order rhythm",
  "offer_strategy": "Offer ladder by churn risk and discount sensitivity",
  "channel_strategy": "WhatsApp primary, SMS fallback",
  "send_time_strategy": "Dinner window based on historical order rhythm",
  "message_strategy": "Personalized favorite-item comeback nudge",
  "success_metric": "Attributed repeat orders within 24h of click"
}
```

### Why this metaphor works

- It is memorable.
- It fits QSR.
- It avoids generic CRM language.
- It makes AI feel like a strategist/chef assembling the right recipe.
- It gives the demo a coherent narrative.

---

## 5. Final feature lock

### Build these deeply

| Priority | Feature | Purpose | Reviewer reaction |
|---|---|---|---|
| P0 | AI Play Copilot | Goal in → executable play out | “This is not a generic create-campaign form.” |
| P0 | Offer Ladder | Different incentives inside one campaign | “They understand margin and personalization.” |
| P0 | Visible Send Monitor | Show async callback lifecycle live | “They understand real messaging infrastructure.” |
| P0 | Performance Kitchen Insight | AI learning after campaign performance | “AI is woven through the loop, not bolted on.” |
| P0.5 | Craving DNA | Computed data layer behind all reasoning | “The AI explanations are grounded in data.” |

### Do not build unless everything above is already excellent

- Manual drag-and-drop segment builder
- Customer profile detail pages
- Deal pipeline
- Lead management
- Support tickets
- Real WhatsApp/SMS/email integrations
- Full loyalty engine
- Menu/inventory management
- Multi-brand support
- Complex role/auth system
- Trained ML model
- Full coupon engine

---

## 6. Final user-facing screens

Only four main screens are required.

### Screen 1 — Growth Kitchen / AI Play Copilot

Purpose: turn business goal into executable play.

Must show:

- plain-English goal input,
- suggested play name,
- audience size,
- audience reasoning,
- offer ladder preview,
- channel recommendation,
- send-time recommendation,
- predicted metrics,
- “Review Play” button.

### Screen 2 — Play Review

Purpose: inspect and approve before launch.

Must show:

- segment rules,
- matched vs eligible audience,
- frequency-cap exclusions,
- offer-tier split,
- channel split,
- message variants,
- sample personalized messages,
- “Launch Play” button.

### Screen 3 — Send Monitor

Purpose: make the two-service architecture visible.

Must show:

- live event stream,
- message ID,
- customer initials or anonymized name,
- channel,
- event type,
- timestamp,
- failure/retry events,
- duplicate callback ignored indicator,
- out-of-order event indicator,
- live aggregate counters.

### Screen 4 — Performance Kitchen

Purpose: show results and learning.

Must show:

- sent,
- delivered,
- failed,
- opened/read,
- clicked,
- attributed orders,
- revenue,
- performance by channel,
- performance by offer tier,
- AI insight,
- suggested next play.

---

## 7. Hero feature 1 — AI Play Copilot

### Intent

The AI Play Copilot is the primary differentiator. Every other submission may have a “create campaign” form. CraveStop should have a marketer typing a business goal and receiving a complete strategy.

### Example marketer input

```text
Bring back spicy-food customers who haven’t ordered recently and drive dinner orders tonight.
```

### Required output

```json
{
  "play_name": "Spicy Comeback Window",
  "objective": "repeat_order_reactivation",
  "audience": {
    "segment_name": "Dormant Spicy Loyalists",
    "matched_count": 1426,
    "frequency_cap_excluded": 178,
    "eligible_count": 1248,
    "rules": [
      "favorite_category = spicy",
      "days_since_last_order >= 21",
      "orders_last_90_days >= 2",
      "churn_risk_score >= 0.55",
      "marketing_opt_in = true"
    ]
  },
  "reasoning": "These customers are 2.1x past their normal order rhythm, 67% usually order during dinner, and WhatsApp has historically produced the highest read rate for this group. Tonight at 6:45 PM is the strongest craving window.",
  "recommended_send_time": "2026-06-10T18:45:00+05:30",
  "recommended_channels": ["whatsapp", "sms_fallback"],
  "offer_strategy": "Use an offer ladder instead of blanket discounting: bonus points for loyal low-risk customers, 10% off for medium-risk customers, and 15% off for high-risk dormant customers.",
  "predicted": {
    "messages_to_send": 1248,
    "delivered": 1179,
    "read_or_opened": 764,
    "clicked": 143,
    "orders": 52,
    "revenue": 23780
  }
}
```

### Why the reasoning text matters

The reasoning is what makes the product feel like an AI strategist rather than an AI form-filler. It must mention actual computed facts:

- rhythm multiplier,
- usual meal period,
- channel performance,
- customer risk/offer logic,
- expected outcome.

Bad reasoning:

```text
This is a good audience because they like spicy food.
```

Good reasoning:

```text
These customers are 2.1x past their normal order rhythm, 67% order during dinner, and WhatsApp has a 1.6x higher read rate than SMS for this group.
```

### Implementation approach

Do not make this a pure LLM black box.

Use a hybrid pipeline:

1. **Intent parser** maps goal text to a play type.
2. **Deterministic play engine** computes segment, counts, scores, offer tiers, send time, and predictions.
3. **Template/LLM writer** turns computed facts into marketer-facing reasoning and message copy.
4. Store the full generated play in the database as structured JSON.

### Play type detection

For MVP, simple keyword mapping is enough:

| Goal keywords | Play type |
|---|---|
| spicy, dinner, comeback, dormant, haven’t ordered | `spicy_comeback_window` |
| usual, routine, morning, evening, time | `craving_clock` |
| low store sales, store, nearby, lunch | `store_heat_rescue` |
| streak, loyalty, points | `streak_rescue` |
| new item, launch, limited-time | `new_menu_matchmaker` |

The demo should primarily use `spicy_comeback_window`.

### Acceptance criteria

The feature is done only if:

- User can type a goal.
- System returns a named play.
- Output includes audience, rules, reasoning, offer ladder, channel/time, messages, predicted metrics.
- Reasoning uses real seed data.
- Play can be approved and converted into a campaign.
- Play output is persisted.

---

## 8. Hero feature 2 — Offer Ladder Personalization

### Intent

Most campaigns are lazy because they blast one discount to everyone. CraveStop should show a smarter approach: one campaign with different offers based on customer risk/value.

This is a subtle but high-signal feature. It shows the product understands margin protection and personalization.

### Offer tiers

| Tier | Customer condition | Offer | Message logic |
|---|---|---|---|
| Loyal / low risk | `churn_risk_score < 0.35` and loyalty tier Gold/Platinum or high engagement | Bonus points / early access | Avoid margin loss; reward habit. |
| Medium risk | `0.35 <= churn_risk_score < 0.70` or medium dormancy | 10% off | Light incentive to restart order rhythm. |
| High risk dormant | `churn_risk_score >= 0.70` or `days_since_last_order >= 45` | 15% off | Stronger recovery offer for likely lost customers. |

### Example messages

Loyal / low risk:

```text
Hey Rhea, your Volcano Burrito streak is heating up 🌶️ Order tonight and earn 2x loyalty points.
```

Medium risk:

```text
Aman, your usual spicy combo is waiting. Get 10% off if you order before 10 PM.
```

High risk dormant:

```text
Naina, it’s been a while. Come back tonight with 15% off your Volcano Burrito combo.
```

### Data requirements

Each generated message must store:

```json
{
  "message_id": "msg_001",
  "campaign_id": "camp_001",
  "customer_id": "cust_001",
  "channel": "whatsapp",
  "offer_tier": "medium_risk_10_percent",
  "offer_id": "offer_spicy_10",
  "personalization": {
    "first_name": "Aman",
    "favorite_item": "Volcano Burrito",
    "nearest_store": "UrbanBite CP",
    "expiry_time": "10 PM"
  },
  "rendered_message": "Aman, your usual spicy combo is waiting. Get 10% off if you order before 10 PM."
}
```

### UI requirements

Play Review must show:

```text
Offer Ladder
- 308 loyal customers → 2x points
- 616 medium-risk customers → 10% off
- 324 high-risk dormant customers → 15% off
```

Performance Kitchen must show conversion by tier:

```text
2x points: 3.2% conversion, ₹8,400 revenue
10% off: 5.8% conversion, ₹11,200 revenue
15% off: 6.4% conversion, ₹9,100 revenue
```

### Acceptance criteria

The feature is done only if:

- Offer tier is assigned per customer.
- Offer tier appears in message records.
- UI shows the offer split before launch.
- Message copy changes by tier.
- Analytics compare conversion by tier.
- Final AI insight can reference tier performance.

---

## 9. Hero feature 3 — Visible Two-Service Send Monitor

### Intent

The assignment emphasizes the separate channel service and callback lifecycle. Many candidates may implement this invisibly. CraveStop should make it visible and impressive.

The reviewer should see:

```text
CRM launches campaign → channel service simulates events → CRM receives callbacks → dashboard updates in real time.
```

### Required architecture

Two services:

1. **CRM service**
   - customers/orders/campaigns/messages/events,
   - segment and play generation,
   - campaign send API,
   - receipt callback API,
   - analytics aggregation.

2. **Channel service**
   - receives send requests,
   - simulates sent/delivered/read/click/fail/retry/order events,
   - calls CRM receipt endpoint asynchronously.

### Required visible events

The Send Monitor should show events like:

```text
18:45:01  msg_001  WhatsApp  sent
18:45:02  msg_004  WhatsApp  failed
18:45:03  msg_001  WhatsApp  delivered
18:45:04  msg_004  WhatsApp  retry_scheduled
18:45:05  msg_004  WhatsApp  sent_after_retry
18:45:06  msg_003  WhatsApp  read
18:45:07  msg_001  WhatsApp  clicked
18:45:08  msg_001  Order     order_created
18:45:09  msg_002  SMS       delivered
18:45:10  msg_001  System    duplicate_callback_ignored
```

### Receipt idempotency

The CRM receipt endpoint must be idempotent.

Primary key:

```text
UNIQUE(event_id)
```

Fallback key:

```text
UNIQUE(message_id, event_type, event_time)
```

If duplicate callback arrives:

- return HTTP 200,
- mark `duplicate: true`,
- do not increment counters,
- optionally show `duplicate_callback_ignored` in the monitor.

Example duplicate response:

```json
{
  "accepted": true,
  "duplicate": true,
  "message": "Event already processed; counters unchanged."
}
```

### Out-of-order handling

Store every non-duplicate event append-only. Derive current status by priority, not arrival order.

Status priority:

```text
queued = 0
sent = 1
failed = 2
retry_scheduled = 2
retrying = 2
sent_after_retry = 3
delivered = 4
opened/read = 5
clicked = 6
order_created = 7
```

Examples:

| Case | Behavior |
|---|---|
| `read` arrives before `delivered` | Store both. Current status = read. |
| `clicked` arrives before `read` | Store both. Current status = clicked. |
| `failed` arrives after `delivered` | Store event, do not downgrade. |
| duplicate `clicked` | Return 200 duplicate; no double count. |

### Channel simulation table

Use deterministic seeding for repeatable demos:

```bash
CHANNEL_SIM_SEED=42
```

| Channel | Failure rate | Delivery delay | Open/read behavior | Click probability | Retry behavior |
|---|---:|---|---|---:|---|
| WhatsApp | 5% | 0.5–2s | read after 3–8s for 65% delivered | 12% delivered | 50% failed retry once after 2s; retry succeeds 70% |
| SMS | 8% | 0.5–1.5s | no read/open | 6% delivered | 40% retry once; retry succeeds 60% |
| Email | 3% | 1–3s | opened after 5–15s for 35% delivered | 4% delivered | no retry in MVP |
| RCS | 7% | 0.5–2.5s | read after 3–10s for 50% delivered | 10% delivered | 50% retry once; retry succeeds 65% |

Order probability after click:

| Channel | Order probability after click |
|---|---:|
| WhatsApp | 36% |
| SMS | 22% |
| Email | 18% |
| RCS | 30% |

Additional simulation requirements:

- 10% of successful callback sequences should be slightly out of order.
- 5% of callbacks should be duplicated.
- Some failed messages should retry.
- At least one duplicate and one out-of-order case should appear in the demo seed/run.

### Acceptance criteria

The feature is done only if:

- CRM and channel service are separate services/processes/routes.
- Campaign launch calls channel service.
- Channel service calls back CRM asynchronously.
- UI shows events arriving live or near-live.
- Failure/retry appears.
- Duplicate callback is safely ignored.
- Out-of-order event does not break current status.
- Aggregates update without double counting.

---

## 10. Hero feature 4 — Performance Kitchen AI Insight

### Intent

This closes the product loop. The campaign begins with AI strategy and ends with AI learning.

The final screen should not only show metrics. It should answer:

> What did we learn, and what should the marketer do next?

### Example insight

```text
High-spice-affinity customers with medium discount sensitivity converted at 2.3x the campaign average. Next run should reserve 15% discounts for high-risk dormant customers and use bonus points for loyal customers to protect margin.
```

### Required inputs

The insight generator must use real metrics:

- channel delivery rate,
- channel click rate,
- conversion by channel,
- conversion by offer tier,
- conversion by churn band,
- revenue by offer tier,
- frequency-cap skipped count,
- failed/retried count,
- audience size and segment facts.

### Required implementation

Use deterministic insight templates as the required implementation. Optional LLM rewrite is allowed, but must have fallback.

Example logic:

```text
if medium_risk_conversion > campaign_average_conversion * 1.5:
    insight = "Medium-risk spicy customers converted {x}x above the campaign average. Keep the 10% offer for this band and avoid over-discounting loyal customers."

elif high_risk_click_rate_high and high_risk_order_rate_low:
    insight = "High-risk dormant customers clicked but did not complete orders. Try a stronger checkout incentive or shorter expiry window."

elif whatsapp_click_rate > sms_click_rate * 1.5:
    insight = "WhatsApp drove {x}x higher click-through than SMS. Keep WhatsApp as primary and reserve SMS for opt-out fallback."

elif frequency_cap_skips > matched_audience * 0.10:
    insight = "A meaningful share of the audience was blocked by contact policy. Widen the segment or wait 2–3 days before rerunning."

else:
    insight = "The play produced steady conversion with no single outlier. Repeat the campaign with a smaller A/B test on offer tiers."
```

### Optional LLM prompt

Use only aggregated metrics, no raw PII.

```json
{
  "campaign_name": "Spicy Comeback Window",
  "objective": "repeat_order_reactivation",
  "metrics": {
    "delivery_rate": 0.949,
    "read_rate": 0.694,
    "click_rate": 0.203,
    "conversion_rate": 0.0697,
    "winning_channel": "whatsapp",
    "winning_offer_tier": "medium_risk_10_percent",
    "best_segment": "high spice affinity + medium discount sensitivity",
    "frequency_cap_skips": 178
  },
  "instruction": "Write one operational learning and one next action. Be specific. Do not give generic marketing advice."
}
```

### Acceptance criteria

The feature is done only if:

- It appears after campaign events/orders exist.
- It references actual campaign results.
- It gives a next action.
- It can reference offer ladder performance.
- It has deterministic fallback.
- It is not a generic sentence.

---

## 11. Supporting layer — Craving DNA

### Intent

Craving DNA is the computed customer profile that powers the Play Copilot and makes the reasoning credible.

Each customer should have one computed Craving DNA row.

### Example Craving DNA record

```json
{
  "customer_id": "cust_001",
  "favorite_category": "spicy",
  "favorite_item": "Volcano Burrito",
  "usual_meal_period": "dinner",
  "usual_order_hour": 19,
  "days_since_last_order": 24,
  "normal_order_gap_days": 11,
  "order_rhythm_multiplier": 2.18,
  "discount_sensitivity": "medium",
  "preferred_channel": "whatsapp",
  "whatsapp_engagement_score": 0.78,
  "sms_engagement_score": 0.34,
  "churn_risk_score": 0.72,
  "predicted_next_best_play": "spicy_comeback_window"
}
```

### Required computed fields

| Field | Definition |
|---|---|
| `favorite_category` | most frequent category in order history |
| `favorite_item` | most frequent item |
| `usual_meal_period` | most common meal period: breakfast/lunch/evening/dinner/late_night |
| `usual_order_hour` | modal order hour |
| `days_since_last_order` | current date minus last order date |
| `normal_order_gap_days` | median gap between historical orders |
| `order_rhythm_multiplier` | `days_since_last_order / max(normal_order_gap_days, 1)` |
| `discount_sensitivity` | derived from historical discount/order behavior |
| `preferred_channel` | highest engagement channel among opted-in channels |
| `churn_risk_score` | deterministic risk score |
| `predicted_next_best_play` | play with highest simple score |

### Churn risk formula

Use deterministic, explainable scoring.

```text
recency_component = min(days_since_last_order / 60, 1.0) * 0.45
rhythm_component = min(order_rhythm_multiplier / 3, 1.0) * 0.25
frequency_component = (1 - min(orders_last_90_days / 10, 1.0)) * 0.15
engagement_component = (1 - max_channel_engagement_score) * 0.15
churn_risk_score = round(sum, 2)
```

### Channel score formula

```text
channel_score =
  opt_in_weight * 0.40 +
  historical_engagement_rate * 0.35 +
  channel_play_fit * 0.15 +
  recent_failure_penalty * -0.10
```

For `spicy_comeback_window`, WhatsApp should usually win because it is urgent, conversational, and demo-friendly.

---

## 12. Frequency cap model

### MVP rule

```text
A customer may receive at most 2 marketing messages in any rolling 7-day window across all campaigns.
```

### Enforcement point 1 — segment/play preview

When previewing a play, show:

```text
1,426 matched behavior rules
178 excluded by frequency cap
1,248 eligible to send
```

### Enforcement point 2 — final dispatch

Re-check cap immediately before creating/sending each message. This handles the race where a customer was eligible at preview but receives another message before launch.

If cap is exceeded, do not send. Insert an audit event:

```json
{
  "event_id": "evt_skip_001",
  "campaign_id": "camp_001",
  "customer_id": "cust_044",
  "event_type": "skipped",
  "reason": "frequency_cap_exceeded",
  "event_time": "2026-06-10T18:45:01+05:30"
}
```

Analytics should show:

```json
{
  "skipped_frequency_cap": 178
}
```

### MVP implementation

Use a transaction around message creation:

```text
1. start transaction
2. count marketing messages for customer in last 7 days
3. if count >= 2: insert skipped event and do not create/send message
4. else create message and call/enqueue channel send
5. commit
```

---

## 13. Attribution model

### MVP rule

Use **last-click within 24 hours wins**.

An order is attributed to a campaign if:

- same `customer_id`,
- order occurs within 24 hours after a `clicked` event,
- if multiple campaign clicks exist, the most recent click before the order wins.

### Tie-breakers

1. Explicit `campaign_id` on order wins if present.
2. Otherwise most recent click before order wins.
3. If two clicks have identical timestamps, latest inserted event wins.
4. Never attribute one order to multiple campaigns in MVP.

### Example

```text
18:10 customer clicks Campaign A
19:00 customer clicks Campaign B
19:30 customer places order
=> attribute to Campaign B
```

### Why this is defensible

QSR purchase cycles are short. A click is a strong intent signal. The rule is simple to explain and test.

---

## 14. Seed data specification

The seed must be large enough to make demo numbers believable.

### Default seed size

| Entity | Count | Notes |
|---|---:|---|
| Customers | 500 | deterministic generated data |
| Orders | 3,000 | average 6 historical orders/customer, uneven distribution |
| Stores | 5 | Delhi, Mumbai, Bengaluru, Hyderabad, Pune |
| Menu items | 20 | spicy, coffee, dessert, sides, bowls, wraps, value, LTO |
| Craving DNA rows | 500 | one per customer |
| Segments | 6 | one per main play type |
| Campaigns | 4 | draft, scheduled, sending, completed |
| Completed events | 1,000–2,000 | preloaded for instant analytics demo |

### Customer distribution

| Field | Distribution |
|---|---|
| City | Delhi 25%, Mumbai 25%, Bengaluru 25%, Hyderabad 15%, Pune 10% |
| Favorite category | spicy 30%, coffee 20%, dessert 15%, comfort 15%, value 10%, healthy-ish 10% |
| Loyalty tier | Bronze 35%, Silver 30%, Gold 25%, Platinum 10% |
| Preferred channel | WhatsApp 45%, SMS 25%, Email 20%, RCS 10% |
| Days since last order | active 0–7d: 25%, warm 8–21d: 35%, dormant 22–60d: 30%, deep dormant 61–120d: 10% |
| Churn risk | low 30%, medium 40%, high 30% |
| Discount sensitivity | low 25%, medium 45%, high 30% |
| App user | true 70%, false 30% |

### Stores

```json
[
  {"store_id": "store_del_cp", "name": "UrbanBite Connaught Place", "city": "Delhi"},
  {"store_id": "store_mum_bkc", "name": "UrbanBite BKC", "city": "Mumbai"},
  {"store_id": "store_blr_indiranagar", "name": "UrbanBite Indiranagar", "city": "Bengaluru"},
  {"store_id": "store_hyd_hitech", "name": "UrbanBite Hitec City", "city": "Hyderabad"},
  {"store_id": "store_pune_kp", "name": "UrbanBite Koregaon Park", "city": "Pune"}
]
```

### Menu examples

```json
[
  {"sku": "sku_volcano_burrito", "name": "Volcano Burrito", "category": "spicy", "price": 299},
  {"sku": "sku_fire_taco", "name": "Fire Crunch Taco", "category": "spicy", "price": 199},
  {"sku": "sku_iced_latte", "name": "Iced Latte", "category": "coffee", "price": 240},
  {"sku": "sku_caramel_cold_brew", "name": "Caramel Cold Brew", "category": "coffee", "price": 260},
  {"sku": "sku_churros", "name": "Churros", "category": "dessert", "price": 159},
  {"sku": "sku_loaded_fries", "name": "Loaded Fries", "category": "sides", "price": 179}
]
```

### Pre-seeded campaigns

1. `camp_spicy_draft` — Spicy Comeback Window, draft.
2. `camp_clock_scheduled` — Craving Clock, scheduled.
3. `camp_store_sending` — Store Heat Rescue, sending/live.
4. `camp_menu_completed` — New Menu Matchmaker, completed with analytics.

---

## 15. Data model

Use this as the minimum data model.

### customers

```sql
customers(
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
  created_at TIMESTAMP
)
```

### orders

```sql
orders(
  order_id TEXT PRIMARY KEY,
  customer_id TEXT,
  store_id TEXT,
  order_time TIMESTAMP,
  order_channel TEXT,
  fulfillment_type TEXT,
  meal_period TEXT,
  order_value NUMERIC,
  discount_used NUMERIC,
  attributed_campaign_id TEXT NULL,
  attribution_source TEXT NULL
)
```

### order_items

```sql
order_items(
  order_item_id TEXT PRIMARY KEY,
  order_id TEXT,
  sku TEXT,
  item_name TEXT,
  category TEXT,
  quantity INTEGER,
  unit_price NUMERIC
)
```

### craving_dna

```sql
craving_dna(
  customer_id TEXT PRIMARY KEY,
  favorite_category TEXT,
  favorite_item TEXT,
  usual_meal_period TEXT,
  usual_order_hour INTEGER,
  days_since_last_order INTEGER,
  normal_order_gap_days INTEGER,
  order_rhythm_multiplier NUMERIC,
  discount_sensitivity TEXT,
  preferred_channel TEXT,
  max_channel_engagement_score NUMERIC,
  churn_risk_score NUMERIC,
  predicted_next_best_play TEXT,
  computed_at TIMESTAMP
)
```

### campaigns

```sql
campaigns(
  campaign_id TEXT PRIMARY KEY,
  play_id TEXT,
  campaign_name TEXT,
  objective TEXT,
  status TEXT,
  segment_rules_json JSON,
  reasoning TEXT,
  recommended_send_time TIMESTAMP,
  predicted_metrics_json JSON,
  created_at TIMESTAMP,
  launched_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL
)
```

### messages

```sql
messages(
  message_id TEXT PRIMARY KEY,
  campaign_id TEXT,
  customer_id TEXT,
  channel TEXT,
  offer_tier TEXT,
  offer_id TEXT,
  rendered_message TEXT,
  current_status TEXT,
  created_at TIMESTAMP,
  sent_at TIMESTAMP NULL
)
```

### communication_events

```sql
communication_events(
  event_id TEXT PRIMARY KEY,
  message_id TEXT,
  campaign_id TEXT,
  customer_id TEXT,
  channel TEXT,
  event_type TEXT,
  event_time TIMESTAMP,
  received_at TIMESTAMP,
  metadata_json JSON,
  duplicate BOOLEAN DEFAULT FALSE
)
```

### offers

```sql
offers(
  offer_id TEXT PRIMARY KEY,
  offer_tier TEXT,
  offer_type TEXT,
  value NUMERIC,
  description TEXT,
  expires_at TIMESTAMP
)
```

---

## 16. API specification

### CRM APIs

#### `POST /api/seed`

Seed demo data.

Response:

```json
{
  "customers": 500,
  "orders": 3000,
  "stores": 5,
  "campaigns": 4,
  "events": 1500
}
```

#### `POST /api/plays/generate`

Input:

```json
{
  "goal": "Bring back spicy-food customers who haven’t ordered recently and drive dinner orders tonight."
}
```

Output: generated play object with audience, reasoning, offer ladder, messages, predictions.

#### `GET /api/plays/{play_id}`

Fetch persisted play.

#### `POST /api/campaigns/from-play`

Create campaign from generated play.

Input:

```json
{
  "play_id": "play_001"
}
```

#### `POST /api/campaigns/{campaign_id}/launch`

Launch campaign. Re-check frequency cap, create messages, call channel service.

Response:

```json
{
  "campaign_id": "camp_001",
  "created_messages": 1248,
  "skipped_frequency_cap": 178,
  "channel_service_batch_id": "batch_001"
}
```

#### `POST /api/receipts`

Callback endpoint used by channel service.

Input:

```json
{
  "event_id": "evt_msg_001_clicked_001",
  "message_id": "msg_001",
  "campaign_id": "camp_001",
  "customer_id": "cust_001",
  "channel": "whatsapp",
  "event_type": "clicked",
  "event_time": "2026-06-10T18:52:00+05:30",
  "metadata": {"cta": "order_now"}
}
```

Output:

```json
{
  "accepted": true,
  "duplicate": false,
  "current_status": "clicked"
}
```

#### `GET /api/campaigns/{campaign_id}/events`

Fetch event stream for Send Monitor.

#### `GET /api/campaigns/{campaign_id}/analytics`

Fetch Performance Kitchen metrics.

#### `POST /api/orders`

Create order, apply attribution rule.

### Channel service APIs

#### `POST /channel/send-batch`

Input from CRM:

```json
{
  "batch_id": "batch_001",
  "campaign_id": "camp_001",
  "callback_url": "http://crm:3000/api/receipts",
  "messages": [
    {
      "message_id": "msg_001",
      "customer_id": "cust_001",
      "channel": "whatsapp",
      "recipient": "+919810000001",
      "body": "Rhea, your Volcano Burrito misses you 🌶️ Get 10% off before 10 PM."
    }
  ]
}
```

Output:

```json
{
  "accepted": true,
  "batch_id": "batch_001",
  "scheduled_messages": 1248
}
```

---

## 17. Analytics metrics

Performance Kitchen should compute:

```json
{
  "campaign_id": "camp_001",
  "sent": 1248,
  "delivered": 1183,
  "failed": 65,
  "read_or_opened": 782,
  "clicked": 149,
  "attributed_orders": 54,
  "attributed_revenue": 24780,
  "delivery_rate": 0.948,
  "click_rate": 0.119,
  "conversion_rate": 0.043,
  "skipped_frequency_cap": 178,
  "by_channel": {
    "whatsapp": {"sent": 936, "clicked": 126, "orders": 46},
    "sms": {"sent": 312, "clicked": 23, "orders": 8}
  },
  "by_offer_tier": {
    "loyal_points": {"sent": 308, "orders": 10, "revenue": 8400},
    "medium_risk_10_percent": {"sent": 616, "orders": 31, "revenue": 11200},
    "high_risk_15_percent": {"sent": 324, "orders": 13, "revenue": 9100}
  },
  "ai_insight": "Medium-risk spicy customers converted 1.7x above the campaign average. Keep the 10% offer for this band and use bonus points for loyal customers to protect margin."
}
```

---

## 18. Demo story

The demo should be one coherent story, not a tour of pages.

### Step 1 — Open Growth Kitchen

Say:

```text
CraveStop is an AI-native CRM for QSR repeat revenue. Instead of manually building campaigns, the marketer gives CraveStop a business goal.
```

### Step 2 — Type the goal

```text
Bring back spicy-food customers who haven’t ordered recently and drive dinner orders tonight.
```

### Step 3 — Show AI Play Copilot output

Emphasize:

```text
It did not just write copy. It selected the audience, explained why, chose the channel, chose the send time, created an offer ladder, and predicted results.
```

### Step 4 — Show Offer Ladder

Say:

```text
I intentionally avoided one blanket discount. Loyal low-risk customers get points, medium-risk customers get 10% off, and high-risk dormant customers get 15% off.
```

### Step 5 — Launch campaign

Say:

```text
When I launch, the CRM creates message records and calls a separate stubbed channel service.
```

### Step 6 — Show Send Monitor

Show callbacks:

- sent,
- delivered,
- read,
- clicked,
- failed,
- retry,
- duplicate ignored,
- order_created.

Say:

```text
The point of this screen is to make the async lifecycle visible. Receipts are idempotent, out-of-order events are stored safely, and current status is derived by state priority.
```

### Step 7 — Show Performance Kitchen

Say:

```text
The loop closes with campaign performance and an AI learning. The system can now recommend how to adjust the next play.
```

---

## 19. Walkthrough video structure

Target length: 5–6 minutes.

### 0:00–0:30 — Product intro

```text
I built CraveStop, an AI-native CRM for QSR repeat revenue. It is not Salesforce for restaurants. It detects craving moments, recommends growth plays, sends personalized messages, and proves whether those messages drove orders.
```

### 0:30–1:50 — Functional demo

Show:

1. Growth Kitchen.
2. Goal prompt.
3. AI play generation.
4. Segment reasoning.
5. Offer ladder.
6. Message variants.
7. Launch.

### 1:50–2:45 — Channel lifecycle demo

Show:

1. CRM calling separate channel service.
2. Live callbacks.
3. Failed message retry.
4. Duplicate ignored.
5. Out-of-order event safely handled.

### 2:45–3:35 — Architecture and tradeoffs

Show a visible architecture diagram and a visible tradeoff list.

Must include:

- direct HTTP for MVP; queues at scale,
- synchronous aggregation for MVP; stream processing at scale,
- deterministic scoring for MVP; trained models at scale,
- DB frequency caps for MVP; contact-policy service at scale.

### 3:35–4:20 — Code walkthrough

Show:

- play generation,
- offer ladder assignment,
- campaign launch path,
- receipt idempotency,
- analytics aggregation.

### 4:20–5:10 — AI-native build workflow

Say how AI was used to build, not only what AI does in the app.

### 5:10–5:40 — Scope decisions

Say:

```text
I chose depth over breadth. I did not build leads, deals, tickets, real messaging integrations, a full loyalty engine, or trained ML. I built one complete shopper engagement loop deeply.
```

---

## 20. Scale tradeoffs

This section must be in the README and visible in the video.

| Area | MVP choice | At scale | Reason |
|---|---|---|---|
| Customer/message volume | 500 seeded customers, 50–1,500 messages per demo campaign | millions of customers, chunked campaign jobs | MVP stays deployable while proving the loop |
| Dispatch | CRM directly calls stub channel batch endpoint | queue-backed dispatch workers with provider rate limits | prevents timeouts for large sends |
| Receipt ingestion | insert event and update aggregates synchronously | fast idempotent write, then async aggregation | keeps provider callbacks fast/retry-safe |
| Analytics | DB queries/counters | materialized views, Redis counters, stream processors | avoids scanning huge event logs |
| AI scoring | deterministic formulas + LLM/templates | trained uplift/churn/send-time models | explainable MVP decisions are defensible |
| Frequency caps | DB lookup at preview and dispatch | dedicated contact-policy service | controls customer fatigue across channels |
| Reliability | simulated retry, no DLQ | exponential backoff, DLQ, replay tooling | shows failure thinking without overbuilding |

Use this sentence:

```text
For this take-home I optimized for a complete, inspectable loop over production-grade infrastructure. At real Xeno scale, dispatch and receipts would move to queues, and analytics would be stream/materialized-view based.
```

---

## 21. AI-native development workflow

The assignment evaluates how AI was used while building. Put this in README and mention it in video.

Recommended bullets:

1. AI was used as a product sparring partner to reject generic CRM ideas and narrow toward QSR craving moments.
2. AI generated multiple schema/API options; the builder manually chose the smallest model that supports customer/order ingestion, segmentation, campaigns, messages, events, and attribution.
3. AI proposed scoring formulas for churn risk, craving windows, offer fit, and channel fit; the builder manually converted them into deterministic functions for explainability.
4. AI generated seed-data distributions and edge cases; the builder manually adjusted them to include dormant, loyal, high-risk, low-risk, app-user, and opt-in variety.
5. AI wrote first-pass handlers/tests; the builder manually reviewed correctness-sensitive paths: duplicate callbacks, out-of-order events, frequency caps, attribution, and analytics aggregation.
6. AI generated message variants and insight copy; the product stores final decisions in structured JSON so reviewers can inspect them.
7. AI was used as a code-review checklist before submission: idempotency, retries, state transitions, counters, README clarity, and video narrative.
8. The builder should say: “I did not blindly ship AI output. Every generated decision path is visible in code and defensible.”

---

## 22. README section — what was intentionally not built

Add this exact section to README.

```md
## What I intentionally did not build

I chose depth over breadth. The assignment asked for a shopper engagement CRM, not a sales/support CRM, so I did not build leads, deals, account pipelines, tickets, or support workflows.

I also did not integrate real WhatsApp/SMS/Email/RCS providers. Instead, I built a separate stubbed channel service because the assignment specifically asks for a simulated channel lifecycle with callbacks.

I did not train a real ML model. For this MVP, scoring is deterministic and inspectable, while language generation/templates are used for marketer-facing explanations and message variants. At production scale, the scoring layer could be replaced with trained uplift, churn, send-time, and next-best-offer models.

I did not build a full loyalty engine, inventory system, multi-brand admin, or complex auth. Those are valid CRM features, but they would dilute the core loop I wanted to demonstrate: data → AI play → personalized send → callback lifecycle → revenue proof.
```

---

## 23. Suggested implementation stack

Any stack is allowed. Recommended simple stack:

### Frontend

- Next.js / React
- Tailwind or shadcn/ui
- Polling or SSE for Send Monitor event stream

### CRM backend

- Node/Express or FastAPI
- PostgreSQL preferred; SQLite acceptable for local MVP if deployed cleanly
- REST APIs

### Channel service

- Separate Node/FastAPI service on different port/process
- Async timers/background tasks for simulated callbacks

### Deployment

- Frontend + CRM backend on one service if needed
- Channel service as second service
- Use environment variable for `CHANNEL_SERVICE_URL` and `CRM_CALLBACK_URL`

Do not waste time on complex auth. A single demo workspace is enough.

---

## 24. Testing checklist

Minimum tests or manual verification cases:

### Play generation

- Goal maps to Spicy Comeback Window.
- Segment rules produce non-zero audience.
- Frequency cap exclusions appear.
- Reasoning includes real computed facts.
- Offer ladder counts sum to eligible audience.

### Offer ladder

- Low-risk users get bonus points.
- Medium-risk users get 10% off.
- High-risk dormant users get 15% off.
- Message copy changes by tier.

### Channel loop

- Campaign launch creates messages.
- Channel service receives send batch.
- CRM receives callbacks.
- Duplicate callback does not double-count.
- Out-of-order event does not downgrade current status.
- Failed message can retry.

### Attribution

- Order within 24h after click attributes to campaign.
- If two campaigns clicked, most recent click wins.
- One order is not attributed to multiple campaigns.

### Analytics

- Sent/delivered/read/click/order counts update.
- By-channel metrics update.
- By-offer-tier metrics update.
- AI insight references actual winning segment/channel/tier.

---

## 25. Final decision ledger

| Area | Final decision |
|---|---|
| Product | CraveStop |
| Workspace metaphor | Growth Kitchen |
| Demo brand | UrbanBite fictional QSR |
| Core object | Growth Play |
| Main demo | Spicy Comeback Window |
| Product spine | AI proposes → marketer approves → channel delivers → AI learns |
| P0 features | AI Play Copilot, Offer Ladder, Send Monitor, Performance Kitchen Insight |
| Supporting layer | Craving DNA |
| Not building | Salesforce CRM, manual segment sprawl, real provider integrations, full loyalty engine |
| AI product role | Goal-in, executable play-out; post-campaign learning |
| AI build workflow | AI-assisted scoping/schema/code/tests, human-reviewed correctness paths |
| Channel design | Separate stubbed channel service with async callbacks |
| Idempotency | `event_id` unique, fallback `message_id + event_type + event_time` |
| Frequency cap | max 2 marketing messages per rolling 7 days, preview + dispatch enforcement |
| Attribution | last-click within 24 hours wins |
| Seed | 500 customers, 3,000 orders, 5 stores, 20 menu items, 4 campaigns |
| Scale stance | direct HTTP/DB for MVP; queues, stream processing, contact-policy service at scale |

---

## 26. Final instruction to builder agent

Build this as a **narrow, polished, end-to-end product**. Do not add features to feel complete. Make the four hero features undeniable.

The reviewer should remember:

1. The AI Play Copilot gave a real strategy, not just copy.
2. The Offer Ladder protected margin while personalizing incentives.
3. The Send Monitor made the async callback architecture visible.
4. The Performance Kitchen closed the loop with a learning.

If those four moments land, CraveStop will feel original, technically serious, and tightly aligned with the assignment.
