# ZPS Ad Intelligence — UI/UX Overhaul Plan

> **Goal**: Clean, modern, pitch-ready dashboard
> **Reference**: AppGrowing, Sensor Tower, DataAI dashboards
> **Stack**: Vanilla HTML/CSS/JS + Chart.js (no framework change)

---

## Current State Assessment

| Aspect | Score | Key Issues |
|--------|-------|------------|
| Design Language | 8/10 | Strong foundation, minor inconsistencies |
| Typography | 9/10 | Well-curated (Syne + DM Sans + DM Mono) |
| Color System | 8/10 | Semantic, intentional; minor a11y concerns |
| Component Design | 7/10 | Emoji placeholders, inline styles |
| Interaction | 6/10 | No cursor:pointer on clickable, rough hovers |
| Responsiveness | 3/10 | Fixed sidebar, no breakpoints |
| **Pitch-readiness** | **5/10** | **Needs polish for professional presentation** |

---

## Design System Updates

### Keep (Already Good)
- Typography stack: **Syne** (headings) + **DM Sans** (body) + **DM Mono** (metrics)
- Purple accent `#5b50e8` — distinctive, professional
- Card system: white bg, subtle borders, consistent padding
- Semantic colors: green/red/amber/blue
- CSS variable system

### Change

#### 1. Replace ALL Emojis with SVG Icons
| Current Emoji | Replace With |
|---------------|-------------|
| 🃏🎴🎮✨ (creative thumbnails) | Gradient placeholder with Lucide icon overlay |
| 🔴🟡🟢 (action queue) | CSS circles with `.dot-critical`, `.dot-warn`, `.dot-ok` |
| 🎬📊📥 (upload slots) | Inline SVG icons (film, chart-bar, download) |
| ❓ (formula help) | Lucide `info` circle icon |

#### 2. Interaction Polish
- Add `cursor: pointer` to ALL clickable elements (chips, cards, buttons, tabs, dropdown triggers)
- Hover states: subtle `translateY(-1px)` + shadow lift on cards (NOT scale — avoids layout shift)
- Active states: `translateY(0)` + deeper shadow
- Transition: `all 0.15s ease-out` (snappier than current 0.12s linear)
- Focus rings: `outline: 2px solid var(--accent); outline-offset: 2px`

#### 3. Spacing & Layout Refinements
- Increase sidebar width: `210px → 220px`
- Tab nav height: add 4px vertical padding (less cramped)
- KPI cards: increase gap `12px → 16px`
- Section headers: add `margin-bottom: 16px` consistently
- Filter bar: single row with horizontal scroll (remove 2-row layout)

#### 4. Color Refinements (Pitch-Ready)
```css
--page:    #f7f8fa;    /* slightly warmer gray */
--panel:   #ffffff;
--accent:  #5b50e8;    /* keep */
--accent-light: #ededfc; /* for hover backgrounds */
--border:  #e8e8f0;    /* softer border */
--shadow:  0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
--shadow-hover: 0 4px 12px rgba(91,80,232,0.08);
```

---

## Component-by-Component Changes

### A. Topbar (Topbar.html + CSS)
**Priority: HIGH — first impression**
- [ ] Replace logo emoji with clean SVG mark
- [ ] "PRO" badge → gradient pill `linear-gradient(135deg, #5b50e8, #7c6ff0)`
- [ ] Sync status: add pulsing green dot when data is live
- [ ] Upload button: add subtle glow effect on hover
- [ ] Bottom border → `box-shadow: 0 1px 0 var(--border)` (softer)

### B. Sidebar (Sidebar.html + CSS)
**Priority: MEDIUM**
- [ ] Active state: replace left border with full bg tint `rgba(91,80,232,0.06)`
- [ ] Add hover background tint on all nav items
- [ ] Icons: ensure consistent 16px sizing with 2px stroke
- [ ] Count badges: use accent bg + white text (more visible)
- [ ] Add subtle divider line between sections

### C. Competitor Selector (CompetitorSelector.html + CSS)
**Priority: HIGH — key interaction point**
- [ ] Active chip: filled accent bg + white text (stronger selection signal)
- [ ] Inactive chips: ghost style (border only, muted text)
- [ ] Add app icon placeholder (16px circle) before each chip name
- [ ] Genre labels: softer badge style with rounded corners
- [ ] Search box: add focus ring + slight expand animation

### D. Filter Bar (FilterBar.html + CSS)
**Priority: HIGH — currently rough**
- [ ] Single row layout with horizontal scroll on overflow
- [ ] Remove 2-row "Basic" / "Creatives" separation
- [ ] Dropdown buttons: pill-shaped, consistent height 32px
- [ ] Active filter count badge: small accent circle on each dropdown
- [ ] Dropdown menus: add subtle shadow + animate slide-down (150ms)
- [ ] Section dot indicators → remove (simplify)

### E. Intel Rail / KPI Bar (IntelRail.html + CSS)
**Priority: HIGH — key data display**
- [ ] Card hover: subtle border-accent + shadow lift
- [ ] Tooltip: add pointer arrow, softer shadow, max-width 240px
- [ ] Help icon: Lucide `info` (12px), muted gray, accent on hover
- [ ] Value colors: add small icon next to color (↑ ↓ — arrows for up/down/neutral)
- [ ] Dividers between KPIs: softer, use `var(--border)` color

### F. Tab Overview (TabOverview.html + CSS)
**Priority: MEDIUM**
- [ ] Signal banner: softer rounded corners (12px), add Lucide `alert-triangle` icon
- [ ] KPI mini grid: add hover shadow lift
- [ ] Summary cards: ensure consistent card height (align grid rows)
- [ ] Action queue: replace emoji circles with CSS `.priority-dot` classes
- [ ] Country bar: add proper labels + hover tooltip

### G. Creative Profile / F1 (TabCreativeProfile.html + CSS)
**Priority: HIGH — most complex tab**
- [ ] Chart toggle buttons: pill group with shared border (segmented control style)
- [ ] Insight pills: add Lucide icons (alert-circle, info, check-circle, alert-triangle)
- [ ] Creative grid thumbnails: replace emoji with gradient + Lucide icon overlay
- [ ] Card hover: cleaner shadow lift (no border color change)
- [ ] Stage badges: rounded pill, bolder colors
- [ ] CHI/CREI section: add mini sparkline or progress bar visual
- [ ] Formula panel: monospace code block with syntax-like highlighting
- [ ] Brainstorm panel: cleaner card design, add "AI" badge to indicate generated

### H. Heatmap / F2 (TabTimerHeatmap.html + CSS)
**Priority: MEDIUM**
- [ ] Timeline dots: increase to 10px, add ring effect on active
- [ ] Heatmap cells: move inline rgba to CSS classes (5 intensity levels)
- [ ] Cell hover: outline instead of scale (avoids layout shift)
- [ ] Add proper color legend bar below heatmap
- [ ] Channel tags: consistent with FilterBar pill style

### I. Playbook / F3 (TabPlaybook.html + CSS)
**Priority: LOW — minimal for pitch**
- [ ] Confidence ring: replace emoji with CSS radial-gradient ring
- [ ] Pattern cards: consistent min-height for grid alignment
- [ ] Test items: cleaner arrow styling (Lucide `arrow-right` 12px)
- [ ] Wide card: responsive 2→1 column on narrow

### J. Upload Panel (UploadPanel.html + CSS)
**Priority: MEDIUM**
- [ ] Upload slot icons: replace emoji with Lucide SVG (film, bar-chart-2, download)
- [ ] Drag area: add dashed border animation on drag-over
- [ ] Loaded state: add checkmark icon instead of ✓ text
- [ ] Analyze button: accent gradient bg, bold weight

---

## Global CSS Additions

### Utility Classes (new)
```css
/* Hover lift for cards */
.hover-lift { transition: all 0.15s ease-out; cursor: pointer; }
.hover-lift:hover { transform: translateY(-1px); box-shadow: var(--shadow-hover); }

/* Status dots (replace emojis) */
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot-critical { background: var(--red); }
.dot-warn { background: var(--amber); }
.dot-ok { background: var(--green); }
.dot-info { background: var(--blue); }

/* Focus ring */
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Responsive Breakpoints (new)
```css
/* Tablet: sidebar collapses */
@media (max-width: 1024px) {
  .shell { grid-template-columns: 56px 1fr; }
  .sidebar .nav-label, .sidebar .section-label { display: none; }
  .sidebar .nav-count { display: none; }
}

/* Mobile: full-width stack */
@media (max-width: 768px) {
  .shell { grid-template-columns: 1fr; grid-template-rows: 48px auto 1fr; }
  .sidebar { position: fixed; transform: translateX(-100%); z-index: 200; }
  .sidebar.open { transform: translateX(0); }
  .kpi-mini-grid { grid-template-columns: 1fr 1fr; }
  .creative-grid { grid-template-columns: 1fr 1fr; }
}
```

---

## Implementation Order (for pitch-readiness)

| Phase | Components | Impact | Effort |
|-------|-----------|--------|--------|
| **P1** | Global CSS (shadows, hover-lift, dots, focus) | Foundation for everything | 20 min |
| **P2** | Topbar + Competitor Selector | First impression | 25 min |
| **P3** | Intel Rail / KPI Bar | Core data display | 20 min |
| **P4** | Filter Bar (single row, pill style) | Clean interaction | 20 min |
| **P5** | Creative Profile / F1 (emoji→SVG, cards) | Main content tab | 30 min |
| **P6** | Tab Overview (signal banner, action queue) | Summary page | 15 min |
| **P7** | Heatmap / F2 + Upload Panel | Supporting tabs | 20 min |
| **P8** | Sidebar + Playbook + Responsive | Final polish | 20 min |

**Total estimated: ~3 hours of implementation**

---

## Before/After Preview

### Topbar
- **Before**: Plain white bar, text "Sensor Tower" badge, static sync label
- **After**: Subtle shadow, gradient PRO badge, pulsing live dot, polished upload button

### Cards & KPIs
- **Before**: Flat cards, no hover effect, emoji decorations
- **After**: Hover lift with accent shadow, SVG icons, clean value display with trend arrows

### Filter Bar
- **Before**: 2-row layout, clunky checkboxes, no visual feedback
- **After**: Single-row pill filters, count badges, smooth dropdown animation

### Creative Grid
- **Before**: Emoji thumbnails (🃏🎴), basic borders
- **After**: Gradient placeholder + icon overlay, shadow lift hover, polished badges
