# ChartScan — Biotech Stock Scanner

A Next.js dashboard that scans the biotech sector for stocks exhibiting a **slow, steady price rise** over 3–12 months. Stocks are ranked using linear regression — the more consistently a stock rises in a straight line, the higher it scores.

---

## How It Works

### The Core Idea

Most screeners look for big price spikes. ChartScan looks for the opposite: stocks where the price moves up **gradually and consistently**, day after day, with minimal noise. These are often institutional accumulation patterns.

### The Math

For each stock, ChartScan runs a **least-squares linear regression** on daily closing prices:

```
y = slope × day + intercept
```

Two numbers come out:

| Metric | What it means |
|--------|---------------|
| **R² (R-squared)** | How closely the price follows a straight line. `1.0` = perfect line, `0.0` = random noise. |
| **Slope** | The price increase per day, in dollars. |

These are combined into a **Composite Score** (R² weighted 60%, annualized return weighted 40%) used to rank results.

### Example

A stock with R² = 0.95 and 18% annualized return scores very high — it's rising steadily and consistently. A stock with R² = 0.60 and 40% return scores lower, because the gains are volatile and hard to hold.

### Time Windows

Every stock is analyzed across four windows: **3, 6, 9, and 12 months**. You can switch between them on the stock detail page to see which trend is strongest.

---

## Architecture

```
Browser ──► Next.js App Router (Vercel)
              │
              ├─ /api/scan           POST  Full market scan
              ├─ /api/stocks         GET   Paginated results
              ├─ /api/stocks/[ticker] GET  Single stock detail
              └─ /api/cron/scan      GET   Vercel cron trigger
                    │
                    ├─ FMP API ──────────► Neon Postgres (results cache)
                    ├─ Yahoo Finance      (fallback if FMP rate-limited)
                    └─ Upstash Redis      (API response cache + rate limiter)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | Neon Postgres + Drizzle ORM |
| Cache | Upstash Redis |
| Charts | Recharts |
| Math | simple-statistics |
| Data (primary) | Financial Modeling Prep (FMP) API |
| Data (fallback) | yahoo-finance2 |
| Deployment | Vercel |
| Tests | Playwright (45 tests) |

### Database Tables

- **`stocks`** — Biotech universe: ticker, name, market cap, exchange
- **`scan_results`** — Regression output per ticker per scan: R², slope, composite score
- **`daily_prices`** — Cached OHLCV history (avoids re-fetching on every scan)

---

## Pages

### Dashboard (`/`)
- Results grid of stock cards sorted by composite score
- Filter bar: R² threshold slider, time period (3/6/9/12mo), sort order
- "Scan Now" button to trigger a manual scan with live progress feedback
- Pagination for large result sets

### Stock Detail (`/stocks/[ticker]`)
- Interactive price chart (Recharts area chart)
- Dashed regression line overlay, color-coded by R² quality
- Metrics panel: R², annualized return, slope, current price, composite score
- Period tabs to compare 3/6/9/12-month trend windows

### Settings (`/settings`)
- Adjust minimum R² threshold, period range, market cap floor, volume floor
- Settings saved to browser localStorage

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/neurotrader2/chart-scan
cd chart-scan
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
# Required immediately
FMP_API_KEY=your_fmp_api_key

# Required for scans and results to persist
DATABASE_URL=postgresql://...@...neon.tech/dbname?sslmode=require
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Required for Vercel cron job (generate any random string)
CRON_SECRET=your_random_secret
```

### 3. Get your API keys

| Service | Free tier | Link |
|---------|-----------|------|
| **FMP** (stock data) | 300 req/min, 20 GB/month | [financialmodelingprep.com](https://financialmodelingprep.com/developer/docs/) |
| **Neon** (Postgres) | 0.5 GB storage, always-on | [neon.tech](https://neon.tech) |
| **Upstash** (Redis) | 10,000 req/day | [console.upstash.com](https://console.upstash.com) |

### 4. Push the database schema

```bash
npm run db:migrate
```

> If this is your first time, run `npm run db:generate` first to create the migration files, then `npm run db:migrate`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **⚡ Scan Now**.

> The first scan fetches up to 500 biotech stocks and their 13-month price histories. It takes 1–3 minutes depending on FMP response times.

---

## Deployment (Vercel)

### Deploy

```bash
npx vercel deploy --prod
```

Or connect the GitHub repo at [vercel.com](https://vercel.com) for automatic deploys on push.

### Add environment variables

In Vercel → Project → Settings → Environment Variables, add all five variables from `.env.local`.

### Cron job

`vercel.json` configures a daily scan at **10:00 PM UTC** (6:00 PM ET, after market close) on weekdays:

```json
{
  "crons": [{ "path": "/api/cron/scan", "schedule": "0 22 * * 1-5" }]
}
```

Vercel sends a `GET /api/cron/scan` request with `Authorization: Bearer <CRON_SECRET>`. This is automatically set up — no extra configuration needed beyond adding the `CRON_SECRET` environment variable.

> **Note:** Automatic cron jobs require a Vercel Pro plan. On the free tier, you can trigger scans manually via the "Scan Now" button.

---

## Running Tests

```bash
npm test          # Run all 45 Playwright tests (headless)
npm run test:ui   # Open Playwright UI for visual debugging
```

Tests use route interception to mock all API calls — they run without any database credentials configured.

---

## Remaining Setup Checklist

- [ ] **Add FMP API key** to `.env.local` (you have this)
- [ ] **Create Neon Postgres database** at [neon.tech](https://neon.tech) → add `DATABASE_URL`
- [ ] **Run `npm run db:migrate`** to create the tables
- [ ] **Create Upstash Redis instance** at [console.upstash.com](https://console.upstash.com) → add URL + token
- [ ] **Run first scan** via the dashboard "Scan Now" button
- [ ] **Deploy to Vercel** and add all five environment variables
- [ ] **Generate a `CRON_SECRET`** (e.g. `openssl rand -hex 32`) for the daily auto-scan

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── settings/page.tsx           # Settings
│   ├── stocks/[ticker]/page.tsx    # Stock detail
│   └── api/
│       ├── scan/route.ts           # POST — run full scan
│       ├── stocks/route.ts         # GET — paginated results
│       ├── stocks/[ticker]/route.ts # GET — single stock
│       └── cron/scan/route.ts      # GET — Vercel cron trigger
├── components/
│   ├── StockCard.tsx               # Dashboard result card
│   ├── RegressionChart.tsx         # Price chart + regression overlay
│   ├── FilterBar.tsx               # R²/period/sort controls
│   ├── ScanButton.tsx              # Animated scan trigger
│   ├── MetricsPanel.tsx            # R², slope, return display
│   └── Navigation.tsx              # App header
├── db/
│   ├── schema.ts                   # Drizzle table definitions
│   └── index.ts                    # Neon client (lazy-initialized)
└── lib/
    ├── analysis.ts                 # Linear regression engine
    ├── fmp.ts                      # FMP API client + caching
    ├── yahoo.ts                    # Yahoo Finance fallback
    └── redis.ts                    # Upstash Redis client
```
