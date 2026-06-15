# Vercel Deployment Checklist

## ✅ What's Been Set Up

### Configuration Files Created:
- [x] Root `vercel.json` — Frontend deployment configuration
- [x] `crm-backend/vercel.json` — Backend serverless configuration
- [x] `channel-service/vercel.json` — Channel service serverless configuration
- [x] `crm-backend/api/index.js` — Backend serverless handler
- [x] `channel-service/api/index.js` — Channel service serverless handler
- [x] `.gitignore` — Excludes DB files, node_modules, and build artifacts
- [x] Environment files:
  - `.env.local` (local dev)
  - `.env.production` (Vercel prod)
  - `.env.development` (dev reference)

### Environment Variables Configured:
- `NEXT_PUBLIC_API_URL` — Points to backend deployment
- `NEXT_PUBLIC_CHANNEL_SERVICE_URL` — Points to channel service deployment

---

## 📋 Deployment Order

1. **Deploy Backend First**
   ```bash
   cd cravestop/crm-backend
   vercel
   ```
   - Project name: `cravestop-backend` → `https://xeno-backend-ecru.vercel.app`

2. **Deploy Channel Service**
   ```bash
   cd cravestop/channel-service
   vercel
   ```
   - Project name: `cravestop-channels` → `https://xeno-channel-service-five.vercel.app`

3. **Deploy Frontend Last**
   ```bash
   cd cravestop/frontend
   vercel env add NEXT_PUBLIC_API_URL https://xeno-backend-ecru.vercel.app
   vercel env add NEXT_PUBLIC_CHANNEL_SERVICE_URL https://xeno-channel-service-five.vercel.app
   vercel
   ```
   - Project name: `cravestop-frontend` → `https://xeno-sage.vercel.app`

---

## 🔧 Quick Links After Deployment

| Service | Deploy Command | URL | Environment |
|---------|---|---|---|
| Backend | `vercel` in `crm-backend/` | `https://xeno-backend-ecru.vercel.app` | Backend APIs |
| Channels | `vercel` in `channel-service/` | `https://xeno-channel-service-five.vercel.app` | Channel simulation |
| Frontend | `vercel` in `frontend/` | `https://xeno-sage.vercel.app` | Web UI |

---

## ⚠️ Important: Database

**SQLite on Vercel is NOT persistent by default.**

### For Development/Testing:
✅ Current setup works fine with ephemeral storage (database resets after deployment)

### For Production:
❌ You'll need to migrate to a hosted database:
- **Turso** (SQLite-compatible)
- **Supabase** (PostgreSQL)
- **PlanetScale** (MySQL)

See `VERCEL_DEPLOYMENT_GUIDE.md` for database migration details.

---

## 🚀 Local Development

Run all three services locally:

```bash
# Terminal 1 - Backend
cd cravestop/crm-backend
npm install
npm run dev

# Terminal 2 - Channel Service
cd cravestop/channel-service
npm install
npm run dev

# Terminal 3 - Frontend
cd cravestop/frontend
npm install
npm run dev
```

Then open: `http://localhost:3002`

---

## 📝 Environment Variables Reference

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://xeno-backend-ecru.vercel.app
NEXT_PUBLIC_CHANNEL_SERVICE_URL=https://xeno-channel-service-five.vercel.app
```

### Backend (Vercel Project Settings)
```
NODE_ENV=production
DB_PATH=./data.db
CHANNEL_SERVICE_URL=https://xeno-channel-service-five.vercel.app/channel/send-batch
```

### Channel Service (Vercel Project Settings)
```
NODE_ENV=production
CHANNEL_SIM_SEED=42
```

---

## 🔗 Service Communication

```
Frontend (3002) 
  └─> Backend API (3000/vercel)
        └─> Channel Service (3001/vercel)
```

The backend calls the channel service to simulate message delivery.

---

## ✨ What's Ready

- ✅ All 3 services can deploy independently
- ✅ Environment variables pre-configured
- ✅ CORS already set up for Vercel domains
- ✅ Database file will initialize on first deploy
- ✅ No additional code changes needed

---

## 🎯 Next Steps

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add Vercel deployment configuration"
   ```

2. **Follow the deployment order above**

3. **Test the deployed services:**
   - Open frontend URL
   - Create a play and campaign
   - Verify backend API is responding
   - Check channel service callbacks

---

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed troubleshooting and production setup.
