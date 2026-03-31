# ZPS Ad Intelligence — Dev Tracker

> Last updated: 2026-03-27
> Owner: Claude (dev) + Chị (PM/UA)

---

## Build 1: Data Engine + UI Refresh `[x] Done`

### P0: Upload CSV → Update toàn bộ UI
> Status: `[x] Done`

- [x] **Tạo \****`updateAllUI(data)`**\*\* function**
  - [x] Map toàn bộ 40+ dynamic elements với ID
  - [x] IntelRail: 7 KPIs (CHI, CREI, DLs, DL trend, Revenue, Creatives, Networks)
  - [x] TabOverview: signal banner, 4 KPI cards, 3 summary cards, country table, RPD cards
  - [x] TabCreativeProfile: CHI/CREI big scores, 4 CHI sub-scores, 3 CREI sub-scores
  - [x] TabTimerHeatmap: timeline container, heatmap container, F2 chart data
  - [x] Charts: Format, Stage, Hook, Trend + computed insight pills
- [x] **Wire \****`analyzeUploads()`***\* → \****`updateAllUI(computed)`**
- [x] **Wire \****`selectComp()`***\* → \****`updateAllUI(appData)`**
- [x] **Template render cho sections phức tạp** (country table, timeline, heatmap)
- [x] **Cleanup hardcoded values** — replaced all hardcoded data with `—` placeholders, JS populates on load

### P5: UI Refresh — Light Theme + Ad Intel Design Principles
> Status: `[x] Done`

- [x] **Design tokens update** (`main.css`)
  - [x] Accent: #5b50e8 → #4d65ff (electric blue)
  - [x] Background: #fff + #f8f9fb
  - [x] Cards: white + 1px #e5e7eb border, lighter shadows
  - [x] Text: #101320 primary, #6b7280 secondary
  - [x] Success/Danger: #10b981 / #ef4444 cho delta badges
  - [x] Font: Inter added (primary), DM Sans fallback
- [x] **Layout refresh**
  - [x] Updated all rgba accent colors across CSS + JS
  - [x] Charts: muted grid (#f3f4f6), updated tooltip colors
  - [x] Clean professional aesthetic applied
- [ ] **Empty/loading states** — skeleton shimmer (deferred to P6)

### Also completed (bonus):
- [x] **P1: Watchlist updated** — Zynga Poker + Coin Master demo data
- [x] **CompetitorSelector.html** — new chips with demo genre labels
- [x] **TabPlaybook.html** — removed 600-line duplicate script block
- [x] **index.html** — added Inter font loading

---

## Build 2: Watchlist + Demo Data `[x] Done (merged into Build 1)`

### P1: Competitor Switching
> Status: `[x] Done`

- [x] Full demo data objects for Zynga Poker + Coin Master in main.js
- [x] Update `CompetitorSelector.html` (bỏ ZPS Poker, Bài Cào)
- [x] Update `selectComp()` → calls `updateAllUI()` with full data
- [x] Cleanup `TabPlaybook.html` duplicate script block

---

## Build 3–5: Overview + Interactive + Weekly + Polish `[x] Done`

### P2: Overview = Competitor Comparison
> Status: `[x] Done`

- [x] Comparison table 4 columns (Metric + 3 apps) with winner badges (★)
- [x] Color coding + winner badges per metric
- [x] `updateCompTable()` dynamic rendering from `compDataFull`

### P3: Interactive Feature Tabs
> Status: `[x] Done`

- [x] F1: Dynamic creative grid via `renderCreativeGrid()` + sort dropdown
- [x] F1: Filter bar with real logic (checkboxes → re-render grid)
- [x] F2: Dynamic timeline + heatmap from data (template-rendered)
- [x] F3: Playbook pattern cards from data

### P4: Sticky Features
> Status: `[x] Done`

- [x] Delta tracking (localStorage) — "CHI 67.5 (↓2.7 vs last week)"
- [x] Action queue checkboxes (persist localStorage) with `.aq-done` toggle
- [x] Export weekly report (1-click Markdown download via `exportReport()`)

### P6: Production Ready
> Status: `[x] Done`

- [ ] Split main.js thành modules (deferred — works as single file)
- [x] Remove auto-label panel + engine từ public version (~270 lines removed)
- [x] Skeleton shimmer CSS ready (`.skeleton` class)
- [x] Responsive QA: 1280px, 1024px, 768px breakpoints
- [x] Deploy Vercel

---

## Build 6: Supabase Schema + Vercel Setup `[x] Done`

> Architecture shift: Browser-only → Full-stack light (Vercel Serverless + Supabase)

- [x] Setup Supabase project (free tier)
- [x] Create DB schema: `watchlist_apps`, `app_snapshots`, `app_markets`, `creatives`, `creative_tags`, `network_impressions`, `action_queue`, `api_usage`
- [x] Enable Row Level Security (RLS)
- [x] Create `package.json` + `vercel.json` + `.gitignore` updates
- [x] Create `.env.example` template
- [x] Validate Supabase connection (8/8 tables OK)

### Security Rules
- **API token NEVER in:** frontend code, git history, logs, chat
- **Token ONLY in:** Vercel env vars (encrypted) + `.env.local` (gitignored)

---

## Build 7: Vercel Serverless API `[x] Done`

- [x] `api/lib/supabase.js` — Supabase client singleton
- [x] `api/lib/sensor-tower.js` — 4 ST API wrappers (search, sales, creatives, network)
- [x] `api/lib/respond.js` — response helpers + API usage logging
- [x] `api/search.js` — proxy Sensor Tower search_entities
- [x] `api/sync.js` — full data sync (3 ST endpoints → CHI/CREI calc → Supabase write)
- [x] `api/sync-all.js` — bulk sync all watchlist apps
- [x] `api/watchlist.js` — CRUD (GET/POST/DELETE)
- [x] `api/creatives.js` — paginated creative list with 6 filters + sort
- [x] CHI/CREI server-side calculation (ported from client)
- [ ] `/api/export/[appId]` — markdown report generation (deferred to Build 14)
- [ ] Rate limiting enforcement (deferred — tracking in api_usage table)

---

## Build 8: Frontend Refactor `[x] Done`

- [x] `src/api.js` — Frontend API client (search, watchlist, sync, creatives)
- [x] Sidebar.html — renamed "Timer / Heatmap" → "Network & Trends", added "Watchlist" nav
- [x] Topbar.html — replaced "Upload data" → "Sync API" button with sync icon
- [x] CompetitorSelector.html — API-powered search with dropdown + dynamic chips
- [x] index.html — removed UploadPanel, loads api.js before main.js
- [x] main.js — added handleSearchInput, handleAddApp, loadWatchlist, selectAppById, handleSyncAll, snapshotToUIData
- [x] switchTab() updated for 'settings' tab + topbar breadcrumb sync
- [x] Fallback: shows demo data if API unavailable

---

## Builds 9–11: Overview + Creative Profile + Scores `[x] Done`

### Build 9: Overview Tab — Multi-App Charts + Market Intel
> Status: `[x] Done`

- [x] Downloads Comparison chart (grouped bar, multi-app by month)
- [x] Revenue Comparison chart (grouped bar, multi-app by month)
- [x] Creative Volume Trend chart (multi-line, multi-app by week)
- [x] Market Intelligence table (top markets per app, winner badges)
- [x] Insight pills for market comparison
- [x] `initOverviewCharts()` + `updateMarketIntel()` functions
- [x] Auto-init on Overview tab load

### Build 10: Creative Profile — Gallery Pagination + Filter Reduction
> Status: `[x] Done`

- [x] Pagination: Prev/Next buttons, page counter, 12 items per page
- [x] Thumbnail support: loads `thumbnail_url` from creative data, falls back to gradient+icon
- [x] FilterBar reduced from 9 → 5 dropdowns: Ad Network, Platform, Format, AI Auto-Tag, Quality
- [x] Filter values wired to `renderCreativeGrid()` logic

### Build 11: CHI/CREI Score Breakdown UI Update
> Status: `[x] Done`

- [x] CHI sub-scores renamed: Active Ads %, Message Variety, Winner Rate, New Ads/Week
- [x] CREI sub-scores renamed: Output Speed, Engagement Change, Channel Spread
- [x] Weight % labels added to each sub-score (×30%, ×25%, etc.)
- [x] Median comparison text in reason lines (e.g., "above median ~45%")
- [x] Formula panel labels updated to match new names

---

## Builds 12–17: Final Batch `[x] Done`

### Build 12: Network & Trends Tab — Full Refactor
> Status: `[x] Done`

- [x] Complete rewrite of `TabTimerHeatmap.html` → Network & Trends layout
- [x] Downloads vs New Creatives combo chart (reused `c-f2-dl` canvas)
- [x] 2×2 creative trends grid: By Hook, By Format, By Stage, Hook Trend sparklines
- [x] Ad Network Performance table with Share column + heatmap coloring
- [x] Network insight pills (`f2-network-pills`)
- [x] Range selector dropdown for chart period
- [x] `renderF2CreativeTrends(d)` in main.js — renders all trend sections
- [x] Wired into `updateAllUI()`

### Build 13: Playbook Tab — Performance Snapshot + Dynamic Patterns
> Status: `[x] Done`

- [x] Complete rewrite of `TabPlaybook.html`
- [x] Performance Snapshot: 4 color-coded KPI cards (Downloads, CHI, Network Risk, Market Gap)
- [x] Action Queue restructured: 3 dynamic tiers (This Week / Next 2 Weeks / Monitor)
- [x] Pattern Cards: dynamically generated from data thresholds (fatigue, volume, network, RPD gap)
- [x] `updatePlaybook(d)`, `renderPlaybookActions(d)`, `renderPlaybookPatterns(d)` in main.js
- [x] Note banner about AppsFlyer/Meta data limitations

### Build 14: Settings Tab + Export Endpoint
> Status: `[x] Done`

- [x] New `TabSettings.html` — watchlist management, API usage, export report
- [x] Watchlist app list with icon, name, sync time, DL count, Refresh/Remove buttons
- [x] API usage progress bar (X/500K), percentage, health badge
- [x] Export report: download button + preview panel
- [x] `api/export.js` — GET `/api/export?app_id=...` → markdown report with metrics table + creative breakdown
- [x] `updateSettingsTab()`, `handleSyncSingle()`, `handleRemoveApp()` in main.js
- [x] Settings tab wired into `switchTab()` handler
- [x] Added to `index.html` component loader

### Build 15: AI Auto-Tagging Endpoint
> Status: `[x] Done`

- [x] `api/ai-tag.js` — POST `/api/ai-tag` with `{ creative_ids }` or `{ app_id }`
- [x] Rule-based classification: 6 hook rules, 5 emotion rules
- [x] Duration/format/status heuristics in `classifyCreative()`
- [x] Batch upsert to `creative_tags` table with confidence scores
- [x] `aiTag(appId)` added to `src/api.js` + `window.api`

### Build 16: Pattern Detection Engine
> Status: `[x] Done`

- [x] `api/patterns.js` — GET `/api/patterns?app_id=...`
- [x] 5 detection rules: creative fatigue (decay >30%), ultra-long runners (>180d), network concentration (HHI >0.6), market RPD gap (>5×), low CHI (<50)
- [x] Returns tiered action items (this_week / next_2_weeks / monitor)
- [x] `getPatterns(appId)` added to `src/api.js` + `window.api`

### Build 17: Polish — Loading States + Skeleton Shimmer
> Detail: See [zps-ad-intelligence-full-build.md](./nimbalyst-local/plans/zps-ad-intelligence-full-build.md)

- [x] `showSkeletonStates()` — adds shimmer to KPI elements showing "—"
- [x] `removeSkeletonStates()` — clears shimmer after data loads
- [x] `.skeleton-text` CSS class added to `main.css` (shimmer animation)
- [x] Wired into `updateAllUI()` — skeleton removed on data load

---

## Changelog

| Date | Build | Update |
| --- | --- | --- |
| 2026-03-26 | — | Plan finalized: P0+P5 gộp Build 1, tổng 5 builds |
|  |  | UI direction: light theme, learn design thinking từ SocialPeta/AppGrowing/MarketIQ |
|  |  | Architecture confirmed: 100% frontend, no backend |
| 2026-03-26 | 1 | **Build 1 complete:** |
|  |  | - `updateAllUI(data)` function: updates 40+ elements across all tabs |
|  |  | - CSS design tokens: new light theme (#4d65ff accent, Inter font, subtle borders) |
|  |  | - `analyzeUploads()` → computes all metrics → `updateAllUI()` |
|  |  | - `selectComp()` → full data objects for 3 apps → `updateAllUI()` |
|  |  | - Watchlist: Conquian (real) + Zynga Poker (demo) + Coin Master (demo) |
|  |  | - TabPlaybook: removed 600-line duplicate script block |
|  |  | - IDs added to IntelRail, TabOverview, TabCreativeProfile, TabTimerHeatmap |
|  |  | - Country bars, timeline, heatmap now template-rendered from data |
| 2026-03-26 | 1.1 | **Hotfix: complete demo data + colors** |
|  |  | - Added missing fields to all 3 `compDataFull` objects: signalHeadline, signalDetail, weekLabels, weeklyCreatives, weeklyDownloads, weeklyTimeline, timelineSummary, channelHeatmap, pills, chiDelta, creiDelta, dlPaceSub |
|  |  | - Now competitor switching updates **ALL** sections: signal banner, charts, timeline, heatmap, insight pills, delta badges |
|  |  | - Fixed F2 chart old colors (#1a1a2e → #101320, #bbbbd0 → #9ca3af, #f0f0f5 → #f3f4f6) |
| 2026-03-27 | 1.2 | **Cleanup hardcoded values** |
|  |  | - Replaced ALL hardcoded data in IntelRail, TabOverview, TabCreativeProfile, TabTimerHeatmap with `—` placeholders |
|  |  | - Added `initDefaultData()` IIFE at end of main.js — calls `initCharts()`, `initF2Chart()`, `updateAllUI(Conquian)` on load |
|  |  | - Added 12 more element updates to `updateAllUI()`: ov-date-range, ov-country-signal, ov-sc1-meta, ov-sc3-meta, ov-aq1–aq6, f1-grid-count |
|  |  | - JS is now **single source of truth** — HTML contains zero data values |
| 2026-03-27 | 1.3 | **5 bug fixes from PUBG testing** |
|  |  | - **#1 Number formatting:** Added `fmtNum()`/`fmtMoney()` — smart K/M/B suffixes, `toLocaleString` for readability |
|  |  | - **#2 Text sections:** Analyst notes (f1, f2) now auto-generated from data. Signal texts computed per app |
|  |  | - **#3 Demo confusion:** After CSV upload, competitor chips deselected, badge shows "Uploaded", app name updated |
|  |  | - **#4 Timeline dates:** Changed from "W1 Jan" to "Jan 5–11" date ranges. Proper Monday-start week grouping |
|  |  | - **#5 Double-upload:** Fixed `event.stopPropagation()` on file inputs — no more double file picker |
|  |  | - Revenue/country breakdown now uses top 2 countries dynamically (not hardcoded US/MX) |
|  |  | - Heatmap cells use `fmtNum()` for consistent formatting |
| 2026-03-27 | 3–5 | **Build 3–5 combined: Overview + Interactive + Weekly + Polish** |
|  |  | - **P2:** Competitor comparison table with winner badges (★), `updateCompTable()` |
|  |  | - **P3:** Dynamic creative grid `renderCreativeGrid()` with sort/filter, max 30 cards |
|  |  | - **P4:** localStorage delta tracking for CHI/CREI, action queue checkboxes, Markdown export |
|  |  | - **P6:** Removed auto-label panel + engine (~270 lines JS, ~60 lines CSS, ~40 lines HTML) |
|  |  | - **P6:** Responsive: 1280px upload/grid, 768px sub-score grids + upload stack |
|  |  | - Renamed `window.alCreatives` → `window.parsedCreatives` for clarity |
| 2026-03-27 | 6 | **Build 6 planned: Sensor Tower API + Supabase integration** |
|  |  | - Architecture shift: pure frontend → Vercel Serverless + Supabase PostgreSQL |
|  |  | - Sensor Tower API confirmed available (account has API token page) |
|  |  | - Key endpoints: search_entities, sales_report_estimates, ad_intel/creatives |
|  |  | - Supabase free tier: watchlists, app_snapshots, actions tables |
|  |  | - UX flow: search app name → auto-pull data → save to watchlist |
| 2026-03-30 | — | **Full Build Plan created** |
|  |  | - Mockup consolidated to 7 screens (from 10), all features mapped |
|  |  | - Full dev plan: `nimbalyst-local/plans/zps-ad-intelligence-full-build.md` |
|  |  | - 7 phases, 12 builds (6–17): DB → API → Frontend refactor → Charts → AI → Polish |
|  |  | - Codebase review: documented all existing features vs new work needed |
|  |  | - DEV-TRACKER updated with Build 6–17 roadmap linked to plan |
| 2026-03-30 | 6 | **Build 6 complete: Supabase + Vercel setup** |
|  |  | - `package.json` + `vercel.json` + `.env.example` + `.gitignore` updated |
|  |  | - Supabase: 8 tables + indexes + RLS + 2 views (SQL migration) |
|  |  | - Connection verified: 8/8 tables OK |
| 2026-03-30 | 7 | **Build 7 complete: Vercel Serverless API** |
|  |  | - 3 shared modules: `api/lib/supabase.js`, `sensor-tower.js`, `respond.js` |
|  |  | - 5 endpoints: `/api/search`, `/api/watchlist`, `/api/sync`, `/api/sync-all`, `/api/creatives` |
|  |  | - CHI/CREI server-side calculation ported from client |
|  |  | - Watchlist POST test verified: write to Supabase OK |
| 2026-03-30 | 8 | **Build 8 complete: Frontend refactor** |
|  |  | - `src/api.js` — frontend API client (search, watchlist, sync, creatives) |
|  |  | - Sidebar: "Timer / Heatmap" → "Network & Trends" + "Watchlist" nav |
|  |  | - Topbar: "Upload data" → "Sync API" button |
|  |  | - CompetitorSelector: API search dropdown + dynamic watchlist chips |
|  |  | - index.html: removed UploadPanel, api.js loaded before main.js |
|  |  | - main.js: search/sync/watchlist handlers, demo fallback on API failure |
| 2026-03-30 | 9–11 | **Builds 9–11 combined: Overview Charts + Creative Gallery + Score UI** |
|  |  | - **B9:** 3 new Chart.js charts: Downloads Comparison, Revenue Comparison, Creative Volume Trend (multi-app grouped bars + multi-line) |
|  |  | - **B9:** Market Intelligence table with winner badges, country comparison across watchlist apps |
|  |  | - **B9:** `initOverviewCharts()`, `updateMarketIntel()`, `splitWeeklyToMonthly()` |
|  |  | - **B10:** Creative grid pagination (12/page, Prev/Next buttons, page counter) |
|  |  | - **B10:** Thumbnail support from `thumbnail_url` with gradient fallback |
|  |  | - **B10:** FilterBar reduced 9 → 5 dropdowns (Ad Network, Platform, Format, AI Auto-Tag, Quality) |
|  |  | - **B11:** CHI sub-scores renamed: Active Ads %, Message Variety, Winner Rate, New Ads/Week |
|  |  | - **B11:** CREI sub-scores renamed: Output Speed, Engagement Change, Channel Spread |
|  |  | - **B11:** Weight % labels (×30%, ×25%, etc.) + median comparison text in reason lines |
| 2026-03-31 | 12–17 | **Builds 12–17 combined: Final batch — all features complete** |
|  |  | - **B12:** Network & Trends tab full rewrite: 2×2 creative trends grid (hook/format/stage/sparklines), network performance table with Share column, insight pills |
|  |  | - **B13:** Playbook tab upgrade: 4 KPI cards (DL, CHI, Network Risk, Market Gap), 3-tier action queue, dynamic pattern cards from data thresholds |
|  |  | - **B14:** Settings tab (NEW): watchlist management list, API usage progress bar, export report with preview; `api/export.js` endpoint |
|  |  | - **B15:** AI auto-tagging: `api/ai-tag.js` with 6 hook + 5 emotion rules, duration/format/status heuristics, batch upsert to `creative_tags` |
|  |  | - **B16:** Pattern detection: `api/patterns.js` with 5 rules (fatigue, ultra-long, HHI, RPD gap, low CHI), tiered action items |
|  |  | - **B17:** Polish: `showSkeletonStates()` / `removeSkeletonStates()`, `.skeleton-text` CSS shimmer class |
|  |  | - **Wiring:** all new functions connected in `updateAllUI()` + `switchTab()` |
