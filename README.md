# ZPS Ad Intelligence

Competitor ad intelligence dashboard cho ZingPlay UA team.

## Cấu trúc project

```
zps-ad-intelligence/
├── index.html                    ← Entry point — mở file này để chạy
├── src/
│   ├── styles/
│   │   └── main.css              ← Toàn bộ CSS (light theme, MarketIQ-inspired)
│   ├── data/
│   │   └── conquian.js           ← Real data từ Sensor Tower export
│   ├── components/
│   │   ├── Topbar.html           ← Logo, breadcrumb, upload button
│   │   ├── UploadPanel.html      ← 3-slot CSV upload (Sensor Tower)
│   │   ├── Sidebar.html          ← Left nav
│   │   ├── CompetitorSelector.html ← Step 1: app watchlist
│   │   ├── IntelRail.html        ← CHI/CREI/KPI bar (always visible)
│   │   ├── FilterBar.html        ← 2-row filter với dropdown options
│   │   ├── TabNav.html           ← Tab buttons
│   │   ├── TabOverview.html      ← Summary + action queue
│   │   ├── TabCreativeProfile.html ← F1: charts + score breakdown + grid + brainstorm
│   │   ├── TabTimerHeatmap.html  ← F2: timeline + Chart.js + heatmap
│   │   └── TabPlaybook.html      ← F3: patterns + data gaps
│   └── main.js                   ← Toàn bộ JavaScript logic
└── README.md
```

## Cách chạy

Vì dùng ES modules (fetch để load components), cần serve qua local server — không mở file:// trực tiếp.

**Cách đơn giản nhất:**
```bash
# Trong terminal, cd vào folder này
cd zps-ad-intelligence
python3 -m http.server 8080
# Mở http://localhost:8080
```

**Hoặc với Node:**
```bash
npx serve .
```

**Trong Nimbalyst:** Mở folder này → Claude Code sẽ thấy toàn bộ codebase.

## Update data

Khi có export mới từ Sensor Tower:

1. Upload 3 CSV files qua nút "Upload data" trong tool (xử lý trong browser)
2. **Hoặc** yêu cầu Claude Code update `src/data/conquian.js` với data mới

## Metric formulas

### CHI — Creative Health Index
```
CHI = active_rate×0.30 + hook_diversity×0.25 + outperform_rate×0.25 + refresh_cadence×0.20

active_rate:     % creatives với last_seen ≤ 3d / total trong 30d
hook_diversity:  min(unique hook categories / 5, 1) × 100
outperform_rate: % creatives với life_cycle > genre median (casual: 21d)
refresh_cadence: min(genre_median_weekly / avg_days_between_launches, 1) × 100
```

### CREI — Creative Risk & Engagement Index
```
CREI = momentum×0.40 + engagement_delta×0.35 + channel_stability×0.25

momentum:          min(new_creatives/week / genre_median × 1.5, 1.5) / 1.5 × 100
engagement_delta:  sigmoid(WoW download change%) × 100
channel_stability: (1 − HHI) × 100, HHI = Σ(channel_share²)
```

## Current data snapshot (Mar 25, 2026)

| Metric | Value |
|--------|-------|
| CHI | 67.5 — At risk (active rate 43%) |
| CREI | 72.2 — High momentum, declining engagement |
| Total downloads | 283.6K (Jan–Mar 2026) |
| Total revenue | $109K |
| Top market | MX 69% DL · US 84% revenue |
| Active creatives | 126 / 388 total |
| Networks | Meta only (Facebook/Instagram/MAN) |

## Alerts

- ⚠️ **4 creatives running 226–359 days** — frequency fatigue risk, audit immediately
- ⚠️ **Downloads declining 3 consecutive months** — Jan 119K → Feb 101K → Mar pace 83K  
- ⚠️ **Single-channel risk** — 100% Meta, no TikTok or Google UAC
- → **US RPD $1.06 vs MX $0.09** — 12× gap, separate strategy needed
