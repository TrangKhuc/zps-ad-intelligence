# ZPS Ad Intelligence — Project Structure & Plan

> **Last updated:** 2026-03-26 — full codebase review + revised plan
> **Repo:** [github.com/TrangKhuc/zps-ad-intelligence](https://github.com/TrangKhuc/zps-ad-intelligence)
> **Run local:** `python3 -m http.server 8080` → [http://localhost:8080](http://localhost:8080)
> **Vercel:** [zps-ad-intelligence-chi.vercel.app](https://zps-ad-intelligence-chi.vercel.app)

---

## File Map

```
zps-ad-intelligence/
├── index.html                     ← Entry point, loads components dynamically
├── src/
│   ├── main.js                    ← All JS logic (853 lines)
│   │   ├── switchTab / setNavActive    — tab & sidebar navigation
│   │   ├── handleFile / parseCSV / readFileText — CSV upload & parsing
│   │   ├── analyzeUploads()            — CHI/CREI computation from CSV
│   │   ├── initCharts / switchChart    — Chart.js (Format/Stage/Hook/Trend)
│   │   ├── initF2Chart()              — F2 combo chart (creatives vs DL)
│   │   ├── selectComp(btn, name)      — competitor switch (compDataReal)
│   │   ├── filterUpdate()             — ⚠ placeholder (UI only, no logic)
│   │   ├── labelOneCreative / runAutoLabel — Claude API auto-labeling
│   │   └── toggleUpload / toggleFormula / toggleBrainstorm / toggleDrop
│   ├── styles/main.css            ← Full CSS + UI overhaul (806 lines)
│   │   ├── Design tokens: #5b50e8 accent, Syne/DM Sans/DM Mono fonts
│   │   ├── SVG icons (Lucide-style), hover lift effects
│   │   ├── Responsive grid, sticky topbar/sidebar/filter
│   │   └── Animations: fadein, pulse-dot, blink, barGrow
│   ├── data/conquian.js           ← Real Sensor Tower data (Jan–Mar 2026)
│   │   ├── APP_DATA: scores, sub-scores, downloads, revenue, countries
│   │   ├── FILTER_OPTIONS: 9 filter categories
│   │   └── FORMULAS: CHI & CREI definitions (Vietnamese)
│   └── components/
│       ├── Topbar.html            ← Logo, breadcrumb, upload button
│       ├── Sidebar.html           ← Left nav (Overview/F1/F2/F3)
│       ├── UploadPanel.html       ← 3-slot CSV upload (SVG icons)
│       ├── CompetitorSelector.html ← Watchlist chips (3 apps)
│       ├── IntelRail.html         ← CHI/CREI/DL/Rev always-visible bar
│       ├── FilterBar.html         ← 9 dropdown filters (UI only)
│       ├── TabNav.html            ← Tab buttons
│       ├── TabOverview.html       ← Signal banner, KPIs, action queue
│       ├── TabCreativeProfile.html ← F1: charts, auto-label, grid, brainstorm (30K)
│       ├── TabTimerHeatmap.html   ← F2: timeline + combo chart + heatmap
│       └── TabPlaybook.html       ← F3: pattern cards + data gaps (38K, has script)
└── project-structure.md           ← This file
```

---

## Current Status (sau UI overhaul merge)

### What's Working

| Component | Status | Details |
| --- | --- | --- |
| CSV Upload + Parse | ✅ Done | 3 files → CHI/CREI/charts auto-update |
| Intel Rail | ✅ Done | 6 KPIs + delta badges + tooltips |
| Overview Tab | ✅ Done | Signal banner, KPI cards, country breakdown, action queue |
| F1 Charts | ✅ Done | 4 views (Format/Stage/Hook/Trend) + insight pills |
| F1 CHI/CREI Formulas | ✅ Done | Expandable panels with sub-scores |
| F1 Auto-Label | ✅ Done | Claude Haiku API → hook/emotion/mechanic per creative |
| F2 Combo Chart | ✅ Done | Dual-axis: new creatives vs downloads (11 weeks) |
| F3 Pattern Cards | ✅ Done | 4 patterns + data gaps card |
| UI Overhaul | ✅ Done | SVG icons, hover effects, responsive, accessibility |
| Competitor Switch | ✅ Done | `selectComp()` updates Intel Rail per app |

### What's Hardcoded / Placeholder

| Component | Issue | Impact |
| --- | --- | --- |
| **Filter Bar** | `filterUpdate()` chỉ toggle CSS class, không filter data | Filters không hoạt động |
| **F1 Creative Grid** | 5 cards hardcoded, sort/view toggle không wired | Không render từ CSV |
| **F1 Brainstorm** | 6 ideas hardcoded, không data-driven | Static content |
| **F2 Timeline** | HTML hardcoded, không generate từ CSV | Không dynamic |
| **F2 Heatmap** | HTML cells hardcoded | Không render từ data |
| **F3 Patterns** | Static text, không auto-detect từ data | Không reactive |
| **Competitor Data** | `compDataReal` in main.js: chỉ Conquian có số, Poker/Bài Cào = "—" | Demo mode |

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

## Revised Plan

### Watchlist Changes

**Hiện tại:** Conquian Zingplay + ZPS Poker + ZPS Bài Cào
**Đổi thành:** Conquian Zingplay (real) + Zynga Poker (demo) + Coin Master (demo)

- Xóa ZPS Poker và ZPS Bài Cào
- Thêm Zynga Poker và Coin Master với demo data hợp lý
- Conquian giữ nguyên real data từ Sensor Tower

### Tab Structure

```
Overview (comparison)  →  F1: Creative Profile  →  F2: Timer/Heatmap  →  F3: Playbook
       │                        │                       │                     │
  So sánh key metrics      Deep-dive per app       Timeline + channel     Patterns +
  giữa 3 apps trong       Charts, grid,            analysis per app      recommendations
  watchlist                auto-label, scores                             per app
```

### Overview Tab — Competitor Comparison (NEW)

Hiện tại Overview chỉ show Conquian data. Cần thêm:

| Section | Mô tả |
| --- | --- |
| **Comparison Table** | Side-by-side CHI/CREI/DL/Rev/Creatives cho 3 apps |
| **Download Trend Overlay** | Line chart: 3 apps trên cùng timeline |
| **Channel Mix** | Bar chart so sánh channel distribution |
| **Winner Badges** | Highlight app dẫn đầu per metric |
| **Quick Actions** | Click app → jump vào F1 deep-dive |

Giữ lại: Signal banner, country breakdown, action queue (cho selected app).

### 3 Feature Tabs (Deep-dive per selected app)

**F1: Creative Profile** — portfolio health
- Charts (Format/Stage/Hook/Trend) ← ✅ done
- Auto-Label (Claude API) ← ✅ done
- CHI/CREI formulas ← ✅ done
- Creative Grid ← ⚠ cần wire sort/filter + render từ CSV
- Brainstorm ← ⚠ cần data-driven ideas

**F2: Timer/Heatmap** — timing & channel analysis
- Combo chart ← ✅ done
- Timeline ← ⚠ cần render từ CSV
- Channel heatmap ← ⚠ cần render từ CSV

**F3: Playbook** — patterns & recommendations
- Pattern cards ← ✅ done (nhưng static)
- Data gaps ← ✅ done
- Cần auto-detect patterns từ analyzed data

---

## Implementation Roadmap (revised)

```
Phase 0 (done):     Code cleanup + UI Overhaul
                    ✅ SVG icons, hover effects, responsive, accessibility
                    ✅ Auto-label panel (Claude AI)
                    ✅ CSV upload + CHI/CREI computation

Phase 1:            Watchlist + Demo Data
                    ├── Đổi CompetitorSelector: Conquian / Zynga Poker / Coin Master
                    ├── Tạo demo data cho Zynga Poker + Coin Master
                    │   (CHI/CREI/DL/Rev/channels/countries — realistic numbers)
                    └── Update compDataReal + conquian.js data module

Phase 2:            Overview Competitor Comparison
                    ├── Comparison table (3 apps side-by-side)
                    ├── Download trend overlay chart (Chart.js)
                    ├── Channel mix comparison
                    ├── Winner badges per metric
                    └── Click-to-deep-dive navigation

Phase 3:            Wire Up Base Features
                    ├── F1 Creative Grid render từ CSV data
                    ├── F1 Grid sort/filter toggle working
                    ├── F2 Timeline + Heatmap render từ CSV
                    ├── F3 Pattern auto-detection từ data
                    └── Filter Bar → real filtering logic

Phase 4:            Polish & Ship
                    ├── F1 Brainstorm data-driven ideas
                    ├── Cross-tab filter state sharing
                    ├── Search box in CompetitorSelector
                    └── Final QA + Vercel deploy
```
