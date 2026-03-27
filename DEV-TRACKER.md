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

## Build 3: Overview + Interactive Tabs `[ ] Pending`

### P2: Overview = Competitor Comparison
> Status: `[ ] Not started`

- [ ] Comparison table 3 columns (CHI/CREI/DL/Rev/RPD)
- [ ] Color coding + winner badges per metric
- [ ] Download trend overlay chart (3 lines)
- [ ] Channel mix comparison bar chart
- [ ] Signal banner comparative
- [ ] Click column → jump F1

### P3: Interactive Feature Tabs
> Status: `[ ] Not started`

- [ ] F1: Dynamic creative grid + pagination + sort
- [ ] F1: Filter bar with real logic
- [ ] F2: Dynamic timeline + heatmap from data
- [ ] F3: Auto-detect patterns from data

---

## Build 4: Weekly Workflow `[ ] Pending`

### P4: Sticky Features
> Status: `[ ] Not started`

- [ ] Delta tracking (localStorage) — "CHI 67.5 (↓2.7 vs tuần trước)"
- [ ] Action queue checkboxes (persist localStorage)
- [ ] Export weekly report (1-click Markdown)
- [ ] Cross-tab deep links

---

## Build 5: Final Polish + Ship `[ ] Pending`

### P6: Production Ready
> Status: `[ ] Not started`

- [ ] Split main.js thành modules
- [ ] Remove auto-label từ public version
- [ ] Empty/loading states (skeleton shimmer)
- [ ] Responsive QA (1280/1440/1920px)
- [ ] Deploy Vercel

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
