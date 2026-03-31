# ZPS Ad Intelligence — Project Structure & Plan

> **Last updated:** 2026-03-27 — Phase 2 architecture: API + Supabase
> **Repo:** [github.com/TrangKhuc/zps-ad-intelligence](https://github.com/TrangKhuc/zps-ad-intelligence)
> **Run local:** `python3 -m http.server 8080` → [http://localhost:8080](http://localhost:8080)
> **Vercel:** [zps-ad-intelligence-chi.vercel.app](https://zps-ad-intelligence-chi.vercel.app)

---

## File Map

```
zps-ad-intelligence/
├── index.html                     ← Entry point, loads components dynamically
├── package.json                   ← [NEW] Dependencies (@supabase/supabase-js)
├── vercel.json                    ← [NEW] API route rewrites
├── .env.local                     ← [NEW] Secrets — GITIGNORED, never commit
├── api/                           ← [NEW] Vercel Serverless Functions
│   ├── search.js                  ← Search apps by name → Sensor Tower API
│   ├── app-data.js                ← Pull all data for 1 app (downloads + creatives + networks)
│   ├── app-info.js                ← App metadata (name, icon, category)
│   ├── watchlist.js               ← CRUD watchlists + apps (Supabase)
│   └── snapshots.js               ← Save/load weekly data snapshots (Supabase)
├── src/
│   ├── main.js                    ← Core JS logic (~1470 lines)
│   │   ├── fmtNum / fmtMoney          — smart K/M/B number formatting
│   │   ├── switchTab / setNavActive    — tab & sidebar navigation
│   │   ├── handleFile / parseCSV       — CSV upload & parsing (fallback)
│   │   ├── analyzeUploads()            — CHI/CREI computation from CSV
│   │   ├── updateAllUI(data)           — single function updates 50+ DOM elements
│   │   ├── updateCompTable(data)       — competitor comparison table with winners
│   │   ├── renderCreativeGrid(arr)     — dynamic creative card grid
│   │   ├── initCharts / switchChart    — Chart.js (Format/Stage/Hook/Trend)
│   │   ├── initF2Chart()              — F2 combo chart (creatives vs DL)
│   │   ├── selectComp(btn, name)      — competitor switch → updateAllUI()
│   │   ├── exportReport()             — 1-click Markdown weekly report
│   │   ├── [NEW] searchApp(term)      — fetch /api/search
│   │   ├── [NEW] fetchAppData(id)     — fetch /api/app-data → updateAllUI()
│   │   ├── [NEW] loadWatchlist()      — fetch /api/watchlist → render chips
│   │   └── [NEW] saveSnapshot(id,d)   — POST /api/snapshots
│   ├── styles/main.css            ← Full CSS (~780 lines)
│   │   ├── Design tokens: #4d65ff accent, Inter font, #f8f9fb bg
│   │   ├── Responsive: 1280px, 1024px, 768px breakpoints
│   │   ├── Action queue, export button, skeleton shimmer
│   │   └── [NEW] App search input, dropdown, watchlist chip styles
│   ├── data/conquian.js           ← Reference data (not imported at runtime)
│   └── components/
│       ├── Topbar.html            ← Logo, breadcrumb, upload button
│       ├── Sidebar.html           ← Left nav (Overview/F1/F2/F3)
│       ├── UploadPanel.html       ← 3-slot CSV upload + "or search app" option
│       ├── CompetitorSelector.html ← [REDESIGN] Search input + dynamic watchlist chips
│       ├── IntelRail.html         ← CHI/CREI/DL/Rev always-visible bar
│       ├── FilterBar.html         ← Filter dropdowns with checkbox logic
│       ├── TabNav.html            ← Tab buttons
│       ├── TabOverview.html       ← Comparison table + signal banner + action queue
│       ├── TabCreativeProfile.html ← F1: charts + scores + creative grid + brainstorm
│       ├── TabTimerHeatmap.html   ← F2: timeline + combo chart + heatmap
│       └── TabPlaybook.html       ← F3: pattern cards + data gaps
├── DEV-TRACKER.md                 ← Build history + changelog
└── project-structure.md           ← This file
```

### Architecture

```
                    ┌──────────────────────────┐
                    │  Sensor Tower API         │
                    │  api.sensortower.com      │
                    └──────────┬───────────────┘
                               │ (auth_token in env var — NEVER in frontend)
                    ┌──────────▼───────────────┐
                    │  Vercel Serverless        │
                    │  /api/search.js           │
                    │  /api/app-data.js         │
                    │  /api/watchlist.js         │
                    │  /api/snapshots.js         │
                    └──────┬───────┬───────────┘
                           │       │
              ┌────────────▼─┐  ┌──▼────────────┐
              │  Supabase    │  │  Frontend      │
              │  PostgreSQL  │  │  (HTML/JS/CSS) │
              │  - watchlists│  │  - updateAllUI │
              │  - snapshots │  │  - charts      │
              │  - actions   │  │  - grids       │
              └──────────────┘  └────────────────┘
```

---

## Current Status (Build 1–5 complete, Phase 2 planned)

### What's Working (Build 1–5)

| Component | Status | Details |
| --- | --- | --- |
| CSV Upload + Parse | ✅ Done | 3 files → CHI/CREI/charts auto-update |
| `updateAllUI(data)` | ✅ Done | Single function updates 50+ DOM elements from data object |
| Intel Rail | ✅ Done | 7 KPIs with `fmtNum()`/`fmtMoney()` formatting |
| Overview Tab | ✅ Done | Comparison table (★ winners), signal banner, KPIs, action queue |
| F1 Creative Grid | ✅ Done | Dynamic `renderCreativeGrid()` with sort/filter |
| F1 Charts + Scores | ✅ Done | 4 chart views + CHI/CREI expandable formulas |
| F2 Timeline + Heatmap | ✅ Done | Template-rendered from data, Monday-start weeks |
| F3 Playbook | ✅ Done | Pattern cards from data |
| Competitor Switch | ✅ Done | 3 apps with full demo data in `compDataFull` |
| Weekly Workflow | ✅ Done | localStorage delta tracking, action checkboxes, Markdown export |
| Responsive | ✅ Done | 1280px, 1024px, 768px breakpoints |
| Deploy | ✅ Done | Vercel production |

### What's Next (Phase 2 — API + Database)

| Component | Current | Target |
| --- | --- | --- |
| **Data source** | Manual CSV upload (3 files) | Sensor Tower API (auto-pull by app name) |
| **Competitor data** | 3 hardcoded apps in `compDataFull` | Dynamic watchlist from Supabase DB |
| **Persistence** | localStorage only | Supabase PostgreSQL (watchlists + snapshots) |
| **Creative thumbnails** | Gradient placeholders | Real thumbnails from Creative URL |
| **Trending** | Single snapshot | 12-week CHI/CREI trend (from DB history) |
| **Auth** | None | Phase 3: Supabase magic link |

### Data Snapshot (Conquian Zingplay, Jan–Mar 2026)

| Metric | Value |
| --- | --- |
| CHI | 67.5 — At risk (active rate 43%) |
| CREI | 72.2 — High momentum, DL declining -4.7% WoW |
| Downloads | 283.6K (Jan 119K → Feb 101K → Mar pace 83K) |
| Revenue | $109K (US 84%, MX 15%) |
| Creatives | 388 total, 126 active, 160 decay |
| Networks | 100% Meta (Facebook/Instagram/MAN) |
| Top markets | MX 69% DL / US 84% Rev — 12x RPD gap |

---

## Roadmap

### Completed (Build 1–5)

```
✅ Build 1:    Data Engine + UI Refresh (P0+P5+P1)
✅ Build 1.1:  Hotfix demo data + chart colors
✅ Build 1.2:  Cleanup hardcoded values → JS single source of truth
✅ Build 1.3:  5 bug fixes from PUBG testing
✅ Build 3–5:  Competitor table, creative grid, weekly workflow, auto-label removal
```

### Next: Build 6 — API + Database

```
Build 6 Phase A:  Validate + Setup
                  ├── Generate Sensor Tower API token
                  ├── Test endpoints (search, downloads, creatives)
                  ├── Vercel serverless functions (api/ folder)
                  ├── Supabase project setup (free tier)
                  └── Database schema (watchlists, snapshots, actions)

Build 6 Phase B:  Core Integration
                  ├── /api/search.js — search apps by name
                  ├── /api/app-data.js — pull downloads + creatives + networks
                  ├── /api/watchlist.js — CRUD watchlists (Supabase)
                  ├── /api/snapshots.js — save/load weekly data history
                  ├── CompetitorSelector redesign → search input + dynamic chips
                  ├── Creative thumbnails from real Creative URLs
                  └── CSV upload kept as fallback

Build 6 Phase C:  Polish + Deploy
                  ├── Loading states for API calls
                  ├── Error handling (API down, rate limits)
                  ├── Vercel env vars setup
                  └── Deploy to production
```

### Future: Build 7+ (sau Build 6)

```
Build 7:  Trending + History
          ├── CHI/CREI trend chart (12 weeks from Supabase snapshots)
          ├── Auto-refresh data weekly (cron/scheduled function)
          └── "Compare with last week" automatic delta

Build 8:  Auth + Team
          ├── Supabase Auth (magic link invite-only)
          ├── Shared watchlists per team
          ├── Action queue assignment
          └── Weekly email digest / Slack integration
```

### Sensor Tower API Endpoints Used

| Endpoint | Purpose | Data |
| --- | --- | --- |
| `POST /v1/unified/search_entities` | Search app by name | app_id, name, icon |
| `GET /v1/unified/sales_report_estimates` | Downloads + revenue | weekly by country |
| `GET /v1/unified/ad_intel/creatives` | Creative gallery | thumbnails, duration, type, networks |
| `GET /v1/unified/ad_intel/network_analysis` | Ad network breakdown | channel distribution |
| `GET /v1/unified/apps` | App metadata | name, publisher, category |
