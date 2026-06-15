# CraveStop

**AI-native CRM for QSR repeat revenue.**  
Demo brand: **UrbanBite**

## Deployed Services

| Service | URL | Tech |
|---|---|---|
| **Frontend** | https://xeno-sage.vercel.app | Next.js 16, Tailwind v4, shadcn/ui |
| **Backend** | https://xeno-backend-ecru.vercel.app | Express, SQLite, AI SDKs |
| **Channel Service** | https://xeno-channel-service-five.vercel.app | Express, deterministic simulation |

## Architecture

```
Marketer (Browser)
      │
      ▼
  [Frontend — xeno-sage.vercel.app]
      │  REST + SSE
      ▼
  [CRM Backend — xeno-backend-ecru.vercel.app]
      │
      │  POST /channel/send-batch
      ▼
  [Channel Service — xeno-channel-service-five.vercel.app]
      │
      │  POST /api/receipts (async callbacks)
      ▼
  [CRM Backend]
```

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

Then open: http://localhost:3002

## Design Decisions

I chose depth over breadth. No leads, deals, account pipelines, tickets, or support workflows.

No real WhatsApp/SMS/Email/RCS providers. The channel service simulates delivery lifecycle with deterministic probabilities and edge cases (duplicate events, out-of-order delivery, retries).

Scoring is deterministic and inspectable. At scale, the scoring layer could be replaced with trained uplift, churn, send-time, and next-best-offer models.

| Area | MVP choice | At scale |
|---|---|---|
| Dispatch | CRM directly calls stub channel batch endpoint | Queue-backed dispatch workers |
| Receipt ingestion | Synchronous insert + aggregate update | Fast idempotent write, async aggregation |
| Analytics | DB queries/counters | Materialized views, Redis counters |
| AI scoring | Deterministic formulas + LLM templates | Trained uplift/churn/send-time models |
| Database | Local SQLite | Turso / Supabase / PlanetScale |
