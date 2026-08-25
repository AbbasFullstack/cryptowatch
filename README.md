# CryptoWatch Signal Desk

> **A personal crypto market-data dashboard with private watchlists, live public price streams, and focused historical charts.**

[![Live demo](https://img.shields.io/badge/Live_demo-CryptoWatch_Signal_Desk-F59E0B?style=for-the-badge&logo=vercel&logoColor=white)](https://cryptowatch-rust.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%2B_Watchlist-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)

## Overview

CryptoWatch Signal Desk helps a signed-in user follow the assets they care about without presenting itself as a trading terminal. It combines a Supabase-authenticated personal watchlist with CoinPaprika market seed data, Binance WebSocket pricing, and Binance historical kline charts.

> **Market-data learning project.** CryptoWatch does not provide trading, custody, price predictions, or investment advice.

## Verified Features

| Capability | Implementation |
|---|---|
| Private watchlists | Supabase email/password authentication and account-scoped saved assets |
| Live market context | Binance `miniTicker` WebSocket data displayed through UI updates batched once per second |
| Asset discovery | Search loaded top-market assets by name or ticker; sort by market rank, price, or 24-hour movement |
| Market movers | Current Top Mover and Lowest Mover cards calculated from loaded 24-hour change data |
| Coin detail view | Individual live price, 24-hour high/low/quote-volume context, and selectable 24H / 7D / 1M / 1Y charts |
| Resilience states | Clear Live, Connecting, Reconnecting, and Stream Offline status plus retryable market-data errors |
| Responsive UX | Carbon-and-amber Signal Desk landing, keyboard-visible focus styles, and reduced-motion support |

## Architecture

```text
Browser
├── Supabase Auth + private watchlist storage
├── CoinPaprika REST ───────────► top-market seed data
├── Binance WebSocket ──────────► live ticker data
└── Binance REST klines ────────► historical price charts
```

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Authentication & data:** Supabase Auth and watchlist storage
- **Market data:** CoinPaprika REST API and Binance public WebSocket / REST APIs
- **Visualization:** Recharts and Lucide icons
- **Deployment:** Vercel

## Run Locally

```bash
git clone https://github.com/AbbasFullstack/cryptowatch.git
cd cryptowatch/frontend
npm install

# Create .env.local with your own Supabase public values
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

npm run dev
```

## Quality Checks

```bash
npm run lint
npm test
npm run build
```

The static regression checks cover the project’s non-advisory wording, market search/sort and reconnect implementation, reduced-motion CSS, and project-specific metadata.

## Project Structure

```text
cryptowatch/
└── frontend/
    ├── app/
    │   ├── auth/page.tsx        # Login and signup
    │   ├── coin/[id]/page.tsx   # Coin chart and live statistics
    │   ├── page.tsx             # Signal Desk landing, market lens, watchlist
    │   └── globals.css          # Global visual and motion styles
    ├── lib/supabase.ts           # Supabase client
    └── tests/signal-desk.test.mjs # Static release checks
```

## Developer

**Abbas Hussain** is a self-taught student full-stack developer building public project work with React, Next.js, APIs, and modern web tooling.

[GitHub](https://github.com/AbbasFullstack) · [Portfolio](https://abbas-portfolio-beta.vercel.app) · [LinkedIn](https://www.linkedin.com/in/abbas-hussain-56a61338b/)
