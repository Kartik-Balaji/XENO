# CraveStop

**AI-native CRM for QSR repeat revenue.**  
Demo brand: **UrbanBite**

## Services

| Service | Port | Purpose |
|---|---|---|
| `crm-backend` | 3000 | Core CRM API, play engine, analytics |
| `channel-service` | 3001 | Stubbed channel simulation + async callbacks |
| `frontend` | 3002 | Next.js UI — Growth Kitchen, Play Review, Send Monitor, Performance Kitchen |

## Quick Start

```bash
# 1. CRM Backend
cd crm-backend && npm install && npm run dev

# 2. Channel Service (separate terminal)
cd channel-service && npm install && npm run dev

# 3. Frontend (separate terminal)
cd frontend && npm install && npm run dev

# 4. Seed demo data
curl -X POST http://localhost:3000/api/seed
```

## Architecture

```
Marketer (Browser)
      │
      ▼
  [Frontend :3002]
      │  REST + SSE
      ▼
  [CRM Backend :3000] ──── POST /channel/send-batch ───► [Channel Service :3001]
      │                                                          │
      │◄──────────── POST /api/receipts (async callbacks) ───────┘
      │
  [SQLite DB]
```

## What I intentionally did not build

I chose depth over breadth. I did not build leads, deals, account pipelines, tickets, or support workflows.

I did not integrate real WhatsApp/SMS/Email/RCS providers. Instead, I built a separate stubbed channel service because the assignment specifically asks for a simulated channel lifecycle with callbacks.

I did not train a real ML model. For this MVP, scoring is deterministic and inspectable, while language generation/templates are used for marketer-facing explanations and message variants. At production scale, the scoring layer could be replaced with trained uplift, churn, send-time, and next-best-offer models.

## Scale Tradeoffs

| Area | MVP choice | At scale |
|---|---|---|
| Dispatch | CRM directly calls stub channel batch endpoint | Queue-backed dispatch workers |
| Receipt ingestion | Synchronous insert + aggregate update | Fast idempotent write, async aggregation |
| Analytics | DB queries/counters | Materialized views, Redis counters |
| AI scoring | Deterministic formulas + LLM templates | Trained uplift/churn/send-time models |
| Frequency caps | DB lookup at preview and dispatch | Dedicated contact-policy service |
