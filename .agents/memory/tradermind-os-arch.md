---
name: TraderMind OS Architecture
description: Key decisions, stack, and conventions for the TraderMind OS trading journal PWA
---

## Stack
React + Vite + TypeScript + Dexie.js (v2, IndexedDB) + Zustand + Recharts + Tailwind + Framer Motion + Lucide + Radix UI + i18next + next-themes + wouter routing

## Core Rules
- **No backend ever** — all data in IndexedDB via Dexie.js
- **Default: Persian language (fa), Dark theme**
- **Artifact**: `artifacts/tradermind-os/`, preview path `/`
- **i18n files**: `src/i18n/locales/fa.json` and `en.json` — must be kept in sync; fa.json is comprehensive (all keys)
- **Routing**: wouter, paths: `/` dashboard, `/journal`, `/analytics`, `/psychology`, `/growth`, `/evolution`, `/settings`

## DB Schema (Dexie v2, 5 tables)
`db.trades`, `db.growthCycles`, `db.cycleMissions`, `db.psychologyLogs`, `db.traderProfile`

## Implemented Features (as of last session)
- 7-step TradeWizard (add + edit mode) — `src/components/TradeWizard.tsx`
- Journal with delete + edit trade buttons — `src/pages/Journal.tsx`
- Analytics with 9 charts — `src/pages/Analytics.tsx`
- Psychology with coping strategies tag-input — `src/pages/Psychology.tsx`
- Growth with actual vs target progress bars — `src/pages/Growth.tsx`
- Evolution with DNA radar + process matrix — `src/pages/Evolution.tsx`
- Settings with export/import/clear — `src/pages/Settings.tsx`
- Dashboard with 8 KPIs + mini equity — `src/pages/Dashboard.tsx`

## Key Behaviors
- Auto R-Multiple: calculated in TradeWizard step 7 via `useEffect` on `pnl` and `riskAmount`
- generateInsights returns Persian strings from `src/lib/analytics.ts`
- Default missions in `useGrowthCycles.ts` seeded in Persian
- TradeDialog.tsx (old 3-step wizard) deleted — use TradeWizard.tsx only
- `useTrades` hook exposes `addTrade`, `updateTrade`, `deleteTrade`

**Why:** User explicitly wants full Persian UI, local-first, no cloud dependency.
