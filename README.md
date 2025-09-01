# AI Graphics News — MVP (Render.com + external PostgreSQL)

This is a minimal starter for the daily AI graphics news app.

## 1) Environment

Create `.env` from `.env.example` and set:

- `DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require`
- `OPENAI_API_KEY=...` (optional for better summaries/tagging)
- `CRON_SECRET=your-strong-secret`

## 2) Local (optional)

```bash
npm i
npx prisma generate
# Make sure DATABASE_URL points to a reachable DB
npm run start:render   # runs migrations + seeds + next start
```

## 3) Render.com

- New **Web Service** (from GitHub).
- Build Command: `npm install && npm run prisma:generate && npm run build`
- Start Command: `npm run start:render`
- Add env vars: `DATABASE_URL`, `OPENAI_API_KEY` (optional), `CRON_SECRET`.

## 4) Cron job

On Render, add a **Cron Job** (UTC):
- Schedule: `05:30 UTC` (which is 07:30 CEST).
- Command: `npm run fetch`

You can also trigger manual fetch:
`GET /api/cron?secret=CRON_SECRET`

## 5) First deploy

- The app will seed tags and starter sources.
- Open the site: you'll see the feed. After first cron/manual run, items appear.
