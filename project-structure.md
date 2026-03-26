# ZPS Ad Intelligence — Project Structure Plan

---

## Part 1: Base Features (hiện tại)

Những gì tool **đã có** và đang hoạt động:

```mermaid
graph TD
    UPLOAD["📂 Upload Data<br/>3 CSV files from Sensor Tower<br/>• Creative Gallery (Detailed)<br/>• Download Channel<br/>• Downloads Detailed"]

    UPLOAD --> SELECT

    SELECT["🎯 Competitor Selector<br/>Watchlist chips: Conquian / Poker / Bài Cào<br/>Click chip → update all KPIs<br/>Demo data pre-loaded for Conquian"]

    SELECT --> INTEL

    INTEL["📊 Intelligence Overview — Intel Rail (always visible)<br/>CHI 67.5 · CREI 72.2 · DL 283.6K · Rev $109K<br/>388 creatives · 1 network (Meta)<br/>Tooltips giải thích từng metric"]

    INTEL --> FILTER

    FILTER["🔽 Filter Bar<br/>10 dropdowns: App / Category / Region / Network<br/>Creative Tag / Type / Hook / Stage / Duration<br/>⚠ filterUpdate() là placeholder — chưa filter thực"]

    FILTER --> TABS

    TABS --> F1
    TABS --> F2
    TABS --> F3

    TABS["Tab Navigation<br/>Sidebar + TopNav đồng bộ<br/>Overview / F1 / F2 / F3"]

    OV["Overview Tab<br/>• Signal banner (DL declining warning)<br/>• 4 KPI mini cards<br/>• Country breakdown (MX 69% DL, US 84% Rev)<br/>• Action queue: 3 tiers × 6 actions"]

    TABS --> OV

    F1["F1: Creative Profile<br/>• 4 chart views: Format / Stage / Hook / Trend<br/>• Insight pills per chart<br/>• CHI + CREI formula breakdown<br/>• Creative grid (5 samples hardcoded)<br/>• Brainstorm panel (6 ideas hardcoded)"]

    F2["F2: Timer / Heatmap<br/>• Weekly creative launch timeline<br/>• Combo chart: new creatives + downloads<br/>• Channel mix heatmap (5 channels × 4 months)<br/>• Channel concentration tags"]

    F3["F3: Playbook<br/>• 5 pattern cards with confidence rings<br/>• Ultra-long runners alert<br/>• Meta single-channel risk<br/>• MX/US RPD gap analysis<br/>• Data gaps list"]

    style UPLOAD fill:#f5f0ff,stroke:#5b50e8
    style SELECT fill:#f5f0ff,stroke:#5b50e8
    style INTEL fill:#fff8e6,stroke:#c97a10
    style FILTER fill:#f5f5f5,stroke:#999
    style TABS fill:#f5f5f5,stroke:#999
    style OV fill:#f0f0f5,stroke:#8888aa
    style F1 fill:#e3f2fd,stroke:#2472c8
    style F2 fill:#e8f5e9,stroke:#0d9e72
    style F3 fill:#fce4ec,stroke:#e04040
```

### Base Feature Status

| Feature | Status | Ghi chú |
| --- | --- | --- |
| CSV Upload (3 files) | ✅ Working | Parse + compute CHI/CREI + update UI |
| Competitor Selector | ✅ Working | 3 chips, click → update Intel Rail |
| Intel Rail (CHI/CREI/KPIs) | ✅ Working | Always visible, tooltips, delta badges |
| Overview Tab | ✅ Working | Signal banner, country breakdown, action queue |
| F1 Charts (Format/Stage/Hook/Trend) | ✅ Working | 4 chart views + insight pills |
| F1 CHI/CREI Formulas | ✅ Working | Expandable panels with sub-scores |
| F1 Creative Grid | ⚠️ Partial | 5 hardcoded samples, sort/view toggle not wired |
| F1 Brainstorm Panel | ⚠️ Partial | 6 ideas hardcoded, not data-driven |
| F2 Combo Chart | ✅ Working | New creatives vs downloads dual-axis |
| F2 Timeline | ⚠️ Partial | Hardcoded timeline items, not from CSV |
| F2 Heatmap | ⚠️ Partial | Hardcoded HTML cells, not from CSV |
| F3 Pattern Cards | ✅ Working | 5 patterns with confidence + recommended tests |
| Filter Bar | ❌ Placeholder | UI exists, `filterUpdate()` does nothing |
| Search in Selector | ❌ Not implemented | Search box exists but no logic |

### Data Flow (hiện tại)

```
ST CSV Upload → parseCSV() → analyzeUploads()
                                    ↓
                    Compute: CHI, CREI, stages, vid buckets,
                    downloads, revenue, countries, channels, HHI
                                    ↓
                    Update UI: Intel Rail + F1 charts (format, stage)
                                    ↓
                    ⚠ Heatmap, timeline, creative grid, playbook
                      vẫn dùng hardcoded data — chưa update từ CSV
```

---

## Part 2: Features cần tối ưu (base features chưa hoàn thiện)

Những gì đã có UI nhưng **chưa hoạt động đúng**:

| # | Feature | Vấn đề | Giải pháp |
| --- | --- | --- | --- |
| 1 | **Filter Bar** | `filterUpdate()` placeholder | Implement real filtering: lọc creative grid + update charts |
| 2 | **F1 Creative Grid** | 5 creatives hardcoded | Render từ parsed CSV data, wire sort/view toggle |
| 3 | **F2 Heatmap** | HTML cells hardcoded | Render dynamically từ Download Channel CSV |
| 4 | **F2 Timeline** | Static timeline items | Generate từ weekly creative launch data |
| 5 | **F3 Patterns** | Static pattern cards | Auto-detect patterns từ analyzed data |
| 6 | **Search box** | No logic | Client-side filter cho app chips |

---

## Part 3: New Features (chị yêu cầu bổ sung)

Tính năng **hoàn toàn mới**, layer lên base:

```mermaid
graph TD
    BASE["Base Features (Part 1 + 2)"] --> NEW

    NEW --> TAG
    NEW --> FBAR
    NEW --> COMP
    NEW --> BRAIN

    TAG["🏷️ NEW: Creative Tags + Hook Tags<br/><b>PRIORITY 1</b><br/>• Auto-tag từ ST data (duration → proxy tag)<br/>• Manual tag editor in creative grid<br/>• Creative tags: Gameplay demo, Social proof,<br/>  Win reveal, Tutorial, UGC-style, Before/After<br/>• Hook tags: Excitement, FOMO, Nostalgia,<br/>  Competitiveness, Relaxation, Social connection<br/>• Persist in localStorage per creative ID"]

    FBAR["🔽 NEW: Dynamic Filter Bar<br/><b>PRIORITY 2</b><br/>• Options update per selected app<br/>• Real filtering → creative grid + charts<br/>• Creative Tag + Hook filter hoạt động thực<br/>• Cross-tab state sharing<br/>• Reset filters button"]

    COMP["📈 NEW: Competitor Comparison Tab<br/><b>PRIORITY 3</b><br/>• Tab riêng trước khi deep-dive per app<br/>• Side-by-side CHI/CREI/DL/Rev<br/>• Download trends overlay chart<br/>• Channel mix comparison<br/>• Winner badges per metric<br/>• Requires multi-app data store"]

    BRAIN["💡 NEW: Creative Brainstorming (in F3)<br/><b>PRIORITY 4</b><br/>• Data-driven idea generation từ gaps<br/>• Template: Hook + Format + Duration + Emotion<br/>• Priority scoring by impact potential<br/>• Export as creative brief<br/>• Save & track: Draft → Production → Live → Result"]

    style BASE fill:#f5f5f5,stroke:#999
    style TAG fill:#fff3e0,stroke:#e65100
    style FBAR fill:#fff3e0,stroke:#e65100
    style COMP fill:#e8f5e9,stroke:#2e7d32
    style BRAIN fill:#fce4ec,stroke:#c62828
```

---

## Part 4: Updated Full Flow (sau khi implement tất cả)

```
┌─────────────────────────────────────────────────────────┐
│  UPLOAD: 3 CSV files per app (multi-app support)        │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  COMPETITOR SELECTOR: Search + watchlist chips           │
│  Select app → filter options + data update dynamically  │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  INTEL RAIL (always visible)                            │
│  CHI · CREI · DL · Rev · Creatives · Networks · Delta   │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  FILTER BAR (persistent, dynamic per app)               │
│  Creative Tag ★ · Hook Tag ★ · Region · Network         │
│  Stage · Duration · Format    ★ = new priority filters  │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  ★ COMPARISON TAB (NEW — all selected apps)             │
│  Side-by-side metrics · DL overlay · Channel comparison │
└────────────────────────┬────────────────────────────────┘
                         ↓ pick one app to deep-dive
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ F1: Creative   │ │ F2: Timer /  │ │ F3: Playbook     │
│ Profile        │ │ Heatmap      │ │ Advisor           │
│                │ │              │ │                    │
│ • Grid by      │ │ • Timeline   │ │ • Pattern cards   │
│   stage        │ │   from CSV   │ │ • Case studies    │
│ • ★ Tag system │ │ • Heatmap    │ │ • Suggested tests │
│ • Hook chart   │ │   from CSV   │ │ • ★ Brainstorm   │
│ • CHI breakdown│ │ • CREI trend │ │   idea generator  │
│ • Anomaly flags│ │ • Blitz badge│ │ • Export brief    │
└────────────────┘ └──────────────┘ └──────────────────┘
         ↑               ↑               ↑
         └───────────────┴───────────────┘
              All tabs share filter state
              Tags persist in localStorage
```

---

## Implementation Roadmap

```
Phase 0 (done):     Code cleanup — duplicates removed, bugs fixed
                    ✅ main.js, UploadPanel, TabPlaybook, CSS, Topbar

Phase 1 (tuần 1):  Hoàn thiện base features
                    ├── F1 Creative Grid render từ CSV data
                    ├── F2 Heatmap + Timeline render từ CSV data
                    └── F3 Pattern auto-detection

Phase 2 (tuần 2):  ★ Creative Tags + Hook Tags system
                    ├── Tag taxonomy + auto-tag from ST data
                    ├── Manual tag editor UI in creative grid
                    └── localStorage persistence

Phase 3 (tuần 2-3): ★ Dynamic Filter Bar
                    ├── Options update per selected app
                    ├── Real filtering → grid + charts
                    ├── Creative Tag + Hook Tag filters
                    └── Cross-tab state sharing

Phase 4 (tuần 3):  ★ Competitor Comparison Tab
                    ├── Multi-app data store
                    ├── Comparison table + overlay chart
                    └── Winner badges

Phase 5 (tuần 4):  ★ Creative Brainstorming in F3
                    ├── Data-driven idea generation
                    ├── Template system + priority scoring
                    └── Export brief function
```

★ = new feature (chị yêu cầu)
