# ZPS Ad Intelligence — Dev Tracker

> Last updated: 2026-03-26
> Owner: Claude (dev) + Chị (PM/UA)

---

## Build 1: Data Engine + UI Refresh `[x] Done`

### P0: Upload CSV → Update toàn bộ UI
> Status: `[x] Done`

- [x] **Tạo `updateAllUI(data)` function**
  - [x] Map toàn bộ 40+ dynamic elements với ID
  - [x] IntelRail: 7 KPIs (CHI, CREI, DLs, DL trend, Revenue, Creatives, Networks)
  - [x] TabOverview: signal banner, 4 KPI cards, 3 summary cards, country table, RPD cards
  - [x] TabCreativeProfile: CHI/CREI big scores, 4 CHI sub-scores, 3 CREI sub-scores
  - [x] TabTimerHeatmap: timeline container, heatmap container, F2 chart data
  - [x] Charts: Format, Stage, Hook, Trend + computed insight pills
- [x] **Wire `analyzeUploads()` → `updateAllUI(computed)`**
- [x] **Wire `selectComp()` → `updateAllUI(appData)`**
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

## Changelog

| Date | Build | Update |
| --- | --- | --- |
| 2026-03-26 | — | Plan finalized: P0+P5 gộp Build 1, tổng 5 builds |
| | | UI direction: light theme, learn design thinking từ SocialPeta/AppGrowing/MarketIQ |
| | | Architecture confirmed: 100% frontend, no backend |
| 2026-03-26 | 1 | **Build 1 complete:** |
| | | - `updateAllUI(data)` function: updates 40+ elements across all tabs |
| | | - CSS design tokens: new light theme (#4d65ff accent, Inter font, subtle borders) |
| | | - `analyzeUploads()` → computes all metrics → `updateAllUI()` |
| | | - `selectComp()` → full data objects for 3 apps → `updateAllUI()` |
| | | - Watchlist: Conquian (real) + Zynga Poker (demo) + Coin Master (demo) |
| | | - TabPlaybook: removed 600-line duplicate script block |
| | | - IDs added to IntelRail, TabOverview, TabCreativeProfile, TabTimerHeatmap |
| | | - Country bars, timeline, heatmap now template-rendered from data |
| 2026-03-26 | 1.1 | **Hotfix: complete demo data + colors** |
| | | - Added missing fields to all 3 `compDataFull` objects: signalHeadline, signalDetail, weekLabels, weeklyCreatives, weeklyDownloads, weeklyTimeline, timelineSummary, channelHeatmap, pills, chiDelta, creiDelta, dlPaceSub |
| | | - Now competitor switching updates **ALL** sections: signal banner, charts, timeline, heatmap, insight pills, delta badges |
| | | - Fixed F2 chart old colors (#1a1a2e → #101320, #bbbbd0 → #9ca3af, #f0f0f5 → #f3f4f6) |
| 2026-03-27 | 1.2 | **Cleanup hardcoded values** |
| | | - Replaced ALL hardcoded data in IntelRail, TabOverview, TabCreativeProfile, TabTimerHeatmap with `—` placeholders |
| | | - Added `initDefaultData()` IIFE at end of main.js — calls `initCharts()`, `initF2Chart()`, `updateAllUI(Conquian)` on load |
| | | - Added 12 more element updates to `updateAllUI()`: ov-date-range, ov-country-signal, ov-sc1-meta, ov-sc3-meta, ov-aq1–aq6, f1-grid-count |
| | | - JS is now **single source of truth** — HTML contains zero data values |
| 2026-03-27 | 1.3 | **5 bug fixes from PUBG testing** |
| | | - **#1 Number formatting:** Added `fmtNum()`/`fmtMoney()` — smart K/M/B suffixes, `toLocaleString` for readability |
| | | - **#2 Text sections:** Analyst notes (f1, f2) now auto-generated from data. Signal texts computed per app |
| | | - **#3 Demo confusion:** After CSV upload, competitor chips deselected, badge shows "Uploaded", app name updated |
| | | - **#4 Timeline dates:** Changed from "W1 Jan" to "Jan 5–11" date ranges. Proper Monday-start week grouping |
| | | - **#5 Double-upload:** Fixed `event.stopPropagation()` on file inputs — no more double file picker |
| | | - Revenue/country breakdown now uses top 2 countries dynamically (not hardcoded US/MX) |
| | | - Heatmap cells use `fmtNum()` for consistent formatting |
| 2026-03-27 | 3–5 | **Build 3–5 combined: Overview + Interactive + Weekly + Polish** |
| | | - **P2:** Competitor comparison table with winner badges (★), `updateCompTable()` |
| | | - **P3:** Dynamic creative grid `renderCreativeGrid()` with sort/filter, max 30 cards |
| | | - **P4:** localStorage delta tracking for CHI/CREI, action queue checkboxes, Markdown export |
| | | - **P6:** Removed auto-label panel + engine (~270 lines JS, ~60 lines CSS, ~40 lines HTML) |
| | | - **P6:** Responsive: 1280px upload/grid, 768px sub-score grids + upload stack |
| | | - Renamed `window.alCreatives` → `window.parsedCreatives` for clarity |
