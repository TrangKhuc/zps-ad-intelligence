// ZPS Ad Intelligence — Main JavaScript

// ── GLOBAL FILTERS STATE ──
window.globalFilters = {
  platform: 'all',
  market: 'all',
  daterange: '90',
  customStart: null,
  customEnd: null,
};

function setGlobalFilter(type, value, btn) {
  window.globalFilters[type] = value;
  if (btn) {
    const toggle = btn.closest('.gf-toggle');
    if (toggle) {
      toggle.querySelectorAll('.gf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  }
  applyGlobalFilters();
}

function handleDateRangeChange(value) {
  const customWrap = document.getElementById('gf-custom-wrap');
  if (value === 'custom') {
    if (customWrap) customWrap.style.display = 'flex';
    // Set default custom range: last 90 days
    const end = new Date();
    const start = new Date(end - 90 * 24 * 60 * 60 * 1000);
    const startInput = document.getElementById('gf-date-start');
    const endInput = document.getElementById('gf-date-end');
    if (startInput) startInput.value = start.toISOString().split('T')[0];
    if (endInput) endInput.value = end.toISOString().split('T')[0];
    return; // Don't apply until user clicks Apply
  }
  if (customWrap) customWrap.style.display = 'none';
  window.globalFilters.daterange = value;
  window.globalFilters.customStart = null;
  window.globalFilters.customEnd = null;
  applyGlobalFilters();
}

function applyCustomDateRange() {
  const startInput = document.getElementById('gf-date-start');
  const endInput = document.getElementById('gf-date-end');
  if (!startInput?.value || !endInput?.value) return;
  window.globalFilters.daterange = 'custom';
  window.globalFilters.customStart = startInput.value;
  window.globalFilters.customEnd = endInput.value;
  applyGlobalFilters();
}

function applyGlobalFilters() {
  const f = window.globalFilters;
  const marketSel = document.getElementById('gf-market');
  if (marketSel) f.market = marketSel.value;

  // Update context label
  const ctx = document.getElementById('gf-context-label');
  if (ctx) {
    const platLabel = f.platform === 'all' ? 'All platforms' : f.platform === 'ios' ? 'iOS' : 'Android';
    const marketLabel = f.market === 'all' ? 'All markets' : f.market === 'WW' ? 'Worldwide' : f.market;
    let dateLabel;
    if (f.daterange === 'custom' && f.customStart && f.customEnd) {
      dateLabel = f.customStart + ' → ' + f.customEnd;
    } else {
      const labels = { '7': 'Last 7 days', '14': 'Last 14 days', '30': 'Last 30 days', '60': 'Last 60 days', '90': 'Last 90 days', '180': 'Last 6 months', '365': 'Last 1 year' };
      dateLabel = labels[f.daterange] || 'Last 90 days';
    }
    ctx.textContent = platLabel + ' · ' + marketLabel + ' · ' + dateLabel;
  }

  // Re-fetch creatives with filters
  if (window.activeAppId && window.api) {
    window.api.getCreatives(window.activeAppId, {
      limit: 200,
      platform: f.platform !== 'all' ? f.platform : undefined,
      date_range: f.daterange !== 'custom' ? f.daterange : undefined,
    }).then(data => {
      const creatives = data.creatives || data.results || data.data || [];
      if (!creatives.length) return;
      const now = Date.now();
      window.parsedCreatives = creatives.map(c => {
        const firstSeen = c.first_seen ? new Date(c.first_seen) : null;
        const dur = firstSeen ? Math.round((now - firstSeen.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return {
          id: c.sensor_tower_creative_id || c.id || '',
          title: c.title || null,
          url: c.preview_url || '',
          thumbnail_url: c.thumbnail_url || null,
          type: c.format || 'video',
          network: c.network || '',
          platform: c.platform || '',
          dur,
          stage: c.status === 'testing' ? 'Testing' : c.status === 'scaling' ? 'Scaling' : c.status === 'decay' ? 'Decay' : dur < 7 ? 'Launch' : dur < 21 ? 'Testing' : dur < 60 ? 'Scaling' : 'Decay',
          vidDur: c.duration_seconds || null,
          firstSeen: c.first_seen || '',
          lastSeen: c.last_seen || '',
          tags: (c.creative_tags || c.tags || []).filter(t => t.tag_type === 'hook' || typeof t === 'string').map(t => typeof t === 'string' ? t : t.tag_value),
          quality: c.quality || null,
        };
      });
      renderCreativeGrid(window.parsedCreatives, 1);
    }).catch(err => console.warn('Filter refresh failed:', err));
  }
}

function set(id, val, cls) {
  const el = document.getElementById(id); if (!el) return;
  el.textContent = val;
  if (cls) el.className = 'kpi-val ' + cls;
}

// ── SMART NUMBER FORMATTER ──
function fmtNum(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n/1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (n/1e3).toFixed(1) + 'K';
  return n.toLocaleString('en-US');
}
function fmtMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return '$' + (n/1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return '$' + (n/1e3).toFixed(1) + 'K';
  return '$' + n.toLocaleString('en-US');
}

function setNavActive(el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

function switchTab(id, btn) {
  document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const tabEl = document.getElementById('tab-' + id);
  if (tabEl) tabEl.classList.add('active');
  if (btn && btn.classList.contains('tab-btn')) btn.classList.add('active');
  // sync sidebar
  const tabToNav = { sum: 0, f1: 1, f2: 2, f3: 3, settings: 4 };
  const navItems = document.querySelectorAll('.sidebar .nav-item');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navItems[tabToNav[id]]) navItems[tabToNav[id]].classList.add('active');
  // Update topbar active tab name
  const tabNames = { sum: 'Overview', f1: 'Creative Profile', f2: 'Network & Trends', f3: 'Playbook', settings: 'Settings' };
  const tabNameEl = document.getElementById('active-tab-name');
  if (tabNameEl) tabNameEl.textContent = tabNames[id] || id;
}

// date pill toggle
document.querySelectorAll('.date-pill').forEach(p => {
  p.addEventListener('click', () => {
    document.querySelectorAll('.date-pill').forEach(x => x.classList.remove('active'));
    p.classList.add('active');
  });
});

// view toggle
document.querySelectorAll('.vbtn').forEach(b => {
  b.addEventListener('click', () => {
    b.closest('.view-toggle').querySelectorAll('.vbtn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
  });
});

// ── FORMULA TOGGLE ──
function toggleFormula(id) {
  const panel = document.getElementById(id);
  panel.classList.toggle('open');
}

// ── CHART.JS INIT ──
let activeChart = 'format';
const chartInstances = {};

const COLORS = {
  video:    'rgba(36,114,200,0.75)',
  image:    'rgba(13,158,114,0.75)',
  playable: 'rgba(201,122,16,0.75)',
  launch:   'rgba(13,158,114,0.75)',
  scale:    'rgba(77,101,255,0.75)',
  decay:    'rgba(224,64,64,0.75)',
  social:   'rgba(13,158,114,0.75)',
  fomo:     'rgba(77,101,255,0.75)',
  gameplay: 'rgba(36,114,200,0.75)',
  challenge:'rgba(201,122,16,0.75)',
  reward:   'rgba(187,187,208,0.75)',
};

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#101320',
      titleFont: { family: 'DM Mono', size: 10 },
      bodyFont:  { family: 'Inter, DM Sans', size: 11 },
      padding: 10, cornerRadius: 6,
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af' } },
    y: { grid: { color: '#f3f4f6', drawBorder: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af' }, beginAtZero: true }
  }
};

function makeChart(id, type, labels, datasets, opts) {
  if (chartInstances[id]) { chartInstances[id].destroy(); }
  const ctx = document.getElementById(id).getContext('2d');
  chartInstances[id] = new Chart(ctx, {
    type,
    data: { labels, datasets },
    options: { ...baseOpts, ...opts }
  });
}

function initCharts() {
  // FORMAT — real data: video vs image, by video duration bucket
  makeChart('c-format', 'bar',
    ['Video 21-30s', 'Video 11-20s', 'Image', 'Video >30s', 'Video ≤10s'],
    [{
      label: 'Số creatives',
      data: [171, 72, 78, 44, 23],
      backgroundColor: [COLORS.video, COLORS.video, COLORS.image, COLORS.video, COLORS.video],
      borderRadius: 4, borderSkipped: false,
    }],
    { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.x + ' creatives (' + Math.round(ctx.parsed.x/388*100) + '% of total)' } } }, scales: { x: { ...baseOpts.scales.x, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#bbbbd0' } }, y: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#4a4a6a' } } } }
  );

  // STAGE — real data: total portfolio stage breakdown
  makeChart('c-stage', 'bar',
    ['Launch (<7d)', 'Testing (7-21d)', 'Scaling (21-60d)', 'Decay (>60d)'],
    [{ label: 'Creatives', data: [78, 89, 61, 160],
       backgroundColor: [COLORS.launch, COLORS.fomo, COLORS.scale, COLORS.decay],
       borderRadius: 4, borderSkipped: false }],
    { indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.x + ' creatives (' + Math.round(ctx.parsed.x/388*100) + '%)' } }
      },
      scales: { x: { grid: { color: '#f0f0f5' }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#bbbbd0' } }, y: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#4a4a6a' } } }
    }
  );

  // HOOK — 100% stacked bar, each week sums to 100%
  // Data normalized: social/fomo/gameplay/challenge/reward per week
  makeChart('c-hook', 'bar',
    ['W-4', 'W-3', 'W-2', 'W-1', 'Now'],
    [
      { label: 'Social proof', data: [48, 52, 60, 68, 72], backgroundColor: COLORS.social,    borderRadius: 2, stack: 'h' },
      { label: 'FOMO',         data: [22, 20, 18, 14, 13], backgroundColor: COLORS.fomo,      borderRadius: 2, stack: 'h' },
      { label: 'Gameplay',     data: [18, 16, 12, 10,  9], backgroundColor: COLORS.gameplay,  borderRadius: 2, stack: 'h' },
      { label: 'Challenge',    data: [ 8,  8,  6,  5,  4], backgroundColor: COLORS.challenge, borderRadius: 2, stack: 'h' },
      { label: 'Reward',       data: [ 4,  4,  4,  3,  2], backgroundColor: COLORS.reward,    borderRadius: 2, stack: 'h' },
    ],
    {
      plugins: {
        legend: { display: true, position: 'bottom', labels: { font: { family: 'DM Mono', size: 9 }, color: '#8888aa', boxWidth: 10, padding: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + '% of creative mix',
            afterBody: () => '(sums to 100% per week)'
          }
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#bbbbd0' } },
        y: { stacked: true, max: 100, grid: { color: '#f0f0f5' }, ticks: { callback: v => v + '%', font: { family: 'DM Mono', size: 9 }, color: '#bbbbd0' } }
      }
    }
  );

  // TREND — real Sensor Tower data: new creatives/week + total downloads/week
  makeChart('c-trend', 'bar',
    ['W1 Jan','W2 Jan','W3 Jan','W4 Jan','W5 Jan','W1 Feb','W2 Feb','W3 Feb','W4 Feb','W1 Mar','W2 Mar','W3 Mar'],
    [
      { label: 'New creatives', data: [17,18,12,34,20,19,25,16,20,19,24,18], backgroundColor: 'rgba(77,101,255,0.65)', borderRadius: 3, yAxisID: 'y', order: 2 },
      { label: 'Downloads (K)', data: [28.6,24.0,26.4,31.3,30.4,22.5,24.4,21.7,19.8,19.7,18.8,2.4], borderColor: 'rgba(224,64,64,0.9)', backgroundColor: 'transparent', type: 'line', tension: 0.4, pointRadius: 3, pointBackgroundColor: 'rgba(224,64,64,0.9)', yAxisID: 'y2', order: 1 },
    ],
    {
      plugins: {
        legend: { display: true, position: 'bottom', labels: { font: { family: 'DM Mono', size: 9 }, color: '#8888aa', boxWidth: 10, padding: 16 } },
        tooltip: {}
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#bbbbd0' } },
        y:  { grid: { color: '#f0f0f5' }, position: 'left',  title: { display: true, text: 'New creatives', font: { family: 'DM Mono', size: 8 }, color: '#bbbbd0' }, ticks: { stepSize: 1, font: { family: 'DM Mono', size: 9 }, color: '#bbbbd0' } },
        y2: { grid: { display: false }, position: 'right', title: { display: true, text: 'Impressions (M)', font: { family: 'DM Mono', size: 8 }, color: '#bbbbd0' }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#bbbbd0' } }
      }
    }
  );
  renderPills('format');
}

// Pills content per chart view
const PILLS = {
  format: [
    { cls: 'warn',  text: 'Video 21-30s dominant (171 creatives, 44%) — nhưng chỉ Meta, chưa test TikTok format' },
    { cls: 'alert', text: 'Image format (78 creatives, 20%) — 5 images đã chạy 498 ngày liên tục, fatigue cao' },
    { cls: 'good',  text: 'Video ngắn ≤10s chỉ 23 creatives (6%) — room để test short-form TikTok-native' },
    { cls: 'info',  text: 'Video >30s có 44 creatives — check xem completion rate có justify length không' },
  ],
  stage: [
    { cls: 'alert', text: '160/388 creatives (41%) ở Decay (>60d) — cao nhất trong 4 stages, cần audit ngay' },
    { cls: 'warn',  text: '78 creatives Launch <7d bị kill sớm — 20% quick-death rate, nhiều test không ra winner' },
    { cls: 'info',  text: 'Chỉ 61 creatives đang Scaling (21-60d) — ít winner được tìm ra và scale lên' },
    { cls: 'good',  text: '89 creatives Testing (7-21d) — pipeline testing đang active, cần theo dõi để escalate' },
  ],
  hook: [
    { cls: 'alert', text: 'Không có hook category data từ Sensor Tower — cần label thủ công hoặc dùng AppGrowing' },
    { cls: 'info',  text: 'Proxy: Video 21-30s (44%) likely gameplay demo hoặc social proof hooks' },
    { cls: 'warn',  text: 'Video ≤10s (6%) có thể là FOMO/teaser hooks — sample quá nhỏ để conclude' },
    { cls: 'good',  text: 'Đa dạng video duration = đa dạng hook intent — tốt hơn là chỉ 1 format duy nhất' },
  ],
  trend: [
    { cls: 'alert', text: 'Downloads giảm song song với creative launches tăng — volume không tạo ra performance' },
    { cls: 'warn',  text: 'Peak launch W3 Jan (34 creatives) không tạo ra download spike tương ứng' },
    { cls: 'info',  text: 'Consistent ~18-25 creatives/tuần từ Feb → Mar — steady testing, không blitz' },
    { cls: 'good',  text: 'Refresh rate 20/tuần = 6.7× casual median — portfolio luôn có creative mới' },
  ],
};

function renderPills(type) {
  const container = document.getElementById('chart-pills');
  if (!container) return;
  const source = window._computedPills || PILLS;
  const pills = source[type] || PILLS[type] || [];
  container.innerHTML = pills
    .map(p => `<div class="ip ${p.cls}"><span class="ip-dot"></span>${p.text}</div>`)
    .join('');
}

function switchChart(type, btn) {
  document.querySelectorAll('.chart-toggle .ct-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['format','stage','hook','trend'].forEach(t => {
    document.getElementById('chart-' + t).style.display = t === type ? 'block' : 'none';
  });
  activeChart = type;
  renderPills(type);
}

// Toggle creative trends views in Network & Trends tab (mockup Screen 5)
function switchF2Trend(type, btn) {
  // Update button styles
  btn.parentElement.querySelectorAll('.ct-btn').forEach(b => {
    b.style.background = '#fff';
    b.style.color = 'var(--t2)';
    b.style.borderColor = 'var(--border)';
    b.classList.remove('active');
  });
  btn.style.background = 'var(--accent)';
  btn.style.color = '#fff';
  btn.style.borderColor = 'var(--accent)';
  btn.classList.add('active');
  // Show/hide content areas
  ['hook', 'format', 'stage'].forEach(t => {
    const el = document.getElementById('f2-trend-' + t);
    if (el) el.style.display = t === type ? '' : 'none';
  });
}

// Init charts when F1/F2 tabs are first opened
const origSwitchTab = switchTab;
window.switchTab = function(id, btn) {
  origSwitchTab(id, btn);
  if (id === 'sum' && !chartInstances['c-ov-dl-compare']) {
    setTimeout(initOverviewCharts, 50);
  }
  if (id === 'f1' && !chartInstances['c-format']) {
    setTimeout(initCharts, 50);
  }
  if (id === 'f2') setTimeout(initF2Chart, 50);
  if (id === 'settings') updateSettingsTab();
};

// Also init if F1 is default visible (it's not, but just in case)
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tab-f1').classList.contains('active')) {
    setTimeout(initCharts, 100);
  }
});

// ══════════════════════════════════════════════════════
// UPDATE ALL UI — single function that updates every dynamic element
// ══════════════════════════════════════════════════════
function updateAllUI(d) {
  if (!d) return;

  // Helper: safe set text + optional class
  function s(id, val, cls) {
    const el = document.getElementById(id); if (!el) return;
    if (typeof val === 'string' && val.includes('<')) el.innerHTML = val;
    else el.textContent = val;
    if (cls !== undefined) el.className = cls;
  }

  // ── INTEL RAIL ──
  s('v-chi', Math.round(d.chi||0), 'kpi-val ' + (d.chi >= 70 ? 'up' : d.chi >= 50 ? 'warn' : 'down'));
  s('s-chi', d.chiSub || ('Active rate ' + Math.round(d.activeRate||0) + '%'));
  s('v-crei', Math.round(d.crei||0), 'kpi-val ' + (d.crei >= 70 ? 'up' : d.crei >= 50 ? 'warn' : 'down'));
  s('s-crei', d.creiSub || ('WoW ' + (d.wow>=0?'+':'') + Math.round(d.wow||0) + '%'));
  s('v-imp', d.dlTotalFmt || fmtNum(d.dlTotal));
  s('s-imp', d.period || '—');
  s('v-dl', d.dlTrend || '—', 'kpi-val ' + (d.dlTrendDir || 'neutral'));
  s('s-dl', d.dlTrendSub || '');
  s('v-rev', d.revFmt || fmtMoney(d.revTotal));
  s('s-rev', d.revSub || '');
  s('v-rank', d.totalCreatives ? d.totalCreatives.toLocaleString('en-US') : '—');
  s('s-rank', (d.activeNow||0).toLocaleString('en-US') + ' active · ' + (d.networkNames || 'Meta only'));
  s('v-sent', d.networkCount || '—', 'kpi-val ' + (d.networkCount > 1 ? 'neutral' : 'warn'));
  s('s-sent', d.networkNames || 'Meta only');

  // ── TAB OVERVIEW ──
  // Signal banner
  if (d.signalHeadline) s('ov-signal-headline', d.signalHeadline);
  if (d.signalDetail) s('ov-signal-detail', d.signalDetail + ' <span class="signal-link" onclick="switchTab(\'f1\', document.querySelectorAll(\'.tab-btn\')[1])">Xem creative breakdown →</span>');

  // KPI mini cards
  s('ov-total-dl', d.dlTotalFmt || fmtNum(d.dlTotal));
  s('ov-dl-sub', d.dlPaceSub || '');
  s('ov-total-rev', d.revFmt || fmtMoney(d.revTotal));
  s('ov-rev-sub', d.revBreakdown || '');
  const activeCreEl = document.getElementById('ov-active-creatives');
  if (activeCreEl) activeCreEl.innerHTML = (d.activeNow||0).toLocaleString('en-US') + '<span style="font-size:13px;color:var(--t2);font-weight:400;"> / ' + (d.totalCreatives||0).toLocaleString('en-US') + '</span>';
  s('ov-active-sub', Math.round((d.activeNow||0)/(d.totalCreatives||1)*100) + '% active rate · ' + (d.stages?.Decay||0) + ' in decay');
  s('ov-avg-wk', (d.avgWk||0).toFixed(1));
  const avgWkMult = d.avgWk ? (d.avgWk/3).toFixed(1) : '—';
  s('ov-avg-wk-sub', avgWkMult + '× casual median (3/wk)');

  // Summary cards
  s('ov-sc1-label', 'Creative Profile · CHI ' + d.chi);
  s('ov-sc1-headline', (d.stages?.Decay||0) + '/' + (d.totalCreatives||0) + ' creatives ở Decay stage — ' + Math.round((d.stages?.Decay||0)/(d.totalCreatives||1)*100) + '%');
  s('ov-sc2-label', 'Download trend · CREI ' + d.crei);
  if (d.topChannel) s('ov-sc2-headline', d.topChannel.name + ' (' + d.topChannel.pct + '%) vẫn là kênh lớn nhất');
  s('ov-sc2-meta', d.monthlyDlSummary || '');
  if (d.countryInsight) s('ov-sc3-headline', d.countryInsight);

  // Country bars
  if (d.topCountries && d.topCountries.length) {
    const cEl = document.getElementById('ov-country-bars');
    if (cEl) {
      const maxDl = d.topCountries[0].dl;
      cEl.innerHTML = d.topCountries.slice(0, 5).map((c, i) => `
        <div class="cb-row">
          <div class="cb-label">${c.code}</div>
          <div class="cb-track"><div class="cb-fill" style="width:${(c.dl/maxDl*100).toFixed(1)}%;background:${i===0?'var(--accent)':i===1?'var(--blue)':'var(--t3)'};"></div></div>
          <div class="cb-val">${c.dl.toLocaleString('en-US')}</div>
        </div>`).join('');
    }
  }

  // Revenue RPD
  if (d.countryRev) {
    const usRev = d.countryRev['US'] || d.countryRev['United States'] || 0;
    const mxRev = d.countryRev['MX'] || d.countryRev['Mexico'] || 0;
    const usDl = d.countryDl?.['US'] || d.countryDl?.['United States'] || 1;
    const mxDl = d.countryDl?.['MX'] || d.countryDl?.['Mexico'] || 1;
    const usRPD = usDl > 0 ? usRev / usDl : 0;
    const mxRPD = mxDl > 0 ? mxRev / mxDl : 0;
    s('ov-us-rev', fmtMoney(usRev));
    s('ov-mx-rev', fmtMoney(mxRev));
    s('ov-us-rpd', '$' + usRPD.toFixed(2));
    s('ov-mx-rpd', '$' + mxRPD.toFixed(2));
    const gap = mxRPD > 0 ? Math.round(usRPD / mxRPD) : '—';
    s('ov-rpd-gap', 'per download · ' + gap + '× gap');
  }

  // Date range + country signal
  if (d.period) s('ov-date-range', d.period + ' · Sensor Tower');
  if (d.countryInsight) s('ov-country-signal', d.countryInsight);

  // Overview summary card meta
  const videoPct2 = d.totalCreatives ? Math.round((d.totalCreatives - (d.imageCount||0)) / d.totalCreatives * 100) : 0;
  s('ov-sc1-meta', 'Video ' + videoPct2 + '% · Image ' + (100-videoPct2) + '% · ' + (d.networkNames || 'Meta only'));
  s('ov-sc3-meta', (d.topCountries?.length || 0) + ' countries tracked');

  // Action queue computed outcomes
  if (d.stages) s('ov-aq1', '→ ' + d.stages.Decay + ' creatives in decay stage — frequency fatigue risk');
  if (d.avgWk) s('ov-aq2', '→ ' + d.avgWk.toFixed(0) + ' creatives/tuần nhưng WoW ' + Math.round(d.wow||0) + '% — creative quality hoặc audience saturation');
  if (d.countryRev) {
    const usRPD2 = d.countryDl?.US > 0 ? (d.countryRev.US / d.countryDl.US).toFixed(2) : '—';
    s('ov-aq3', '→ US RPD $' + usRPD2 + ' — ' + (d.networkCount > 1 ? d.networkCount + ' networks active' : 'single-channel risk, cần mở rộng'));
  }
  if (d.avgWk) s('ov-aq4', '→ refresh rate ' + d.avgWk.toFixed(1) + '/wk = ' + (d.avgWk/3).toFixed(1) + '× casual median');
  if (d.dlTrendSub) s('ov-aq5', '→ ' + d.dlTrendSub);
  if (d.topChannel) s('ov-aq6', '→ ' + d.topChannel.name + ' (' + d.topChannel.pct + '%) — leverage ASO/organic optimization');

  // F1 grid count
  s('f1-grid-count', (d.activeNow||0) + ' active · sorted by duration');

  // Analyst notes — computed from data
  if (d.totalCreatives) {
    const decayPct = Math.round((d.stages?.Decay||0)/(d.totalCreatives||1)*100);
    const vidPct = d.totalCreatives ? Math.round((d.totalCreatives - (d.imageCount||0)) / d.totalCreatives * 100) : 0;
    s('f1-analyst-note', '<strong>CHI ' + Math.round(d.chi||0) + '</strong> · Active rate ' + Math.round(d.activeRate||0) + '% · ' +
      (d.stages?.Decay||0) + '/' + d.totalCreatives + ' creatives (' + decayPct + '%) in Decay stage. ' +
      'Video chiếm ' + vidPct + '%, image ' + (100-vidPct) + '%. ' +
      'Refresh cadence ' + (d.avgWk||0).toFixed(1) + ' creatives/tuần (' + (d.avgWk ? (d.avgWk/3).toFixed(1) : '—') + '× casual median). ' +
      (decayPct > 40 ? 'Decay rate cao — cần audit creatives cũ.' : decayPct > 25 ? 'Decay rate moderate — monitor closely.' : 'Healthy creative lifecycle.'));
  }
  if (d.topChannel) {
    s('f2-analyst-note', '<strong>Channel mix analysis:</strong> ' + d.topChannel.name + ' (' + d.topChannel.pct + '%) là kênh lớn nhất. ' +
      (d.networkCount > 1 ? d.networkCount + ' channels active — diversified.' : 'Single-channel (Meta only) — concentration risk.') + ' ' +
      'Downloads ' + (d.dlTrend||'—') + '. ' +
      (d.dlTrendDir === 'down' ? 'Tất cả channels đều giảm — vấn đề có thể ở creative fatigue hoặc audience saturation.' :
       d.dlTrendDir === 'up' ? 'Positive momentum across channels.' : ''));
  }

  // ── TAB F1: CREATIVE PROFILE ──
  // CHI + CREI big scores
  const f1ChiEl = document.getElementById('f1-chi-big');
  if (f1ChiEl) f1ChiEl.innerHTML = Math.round(d.chi) + ' <span class="delta-badge ' + (d.chiDelta >= 0 ? 'up' : 'down') + '" style="font-size:9px;vertical-align:middle;">' + (d.chiDelta >= 0 ? '↑' : '↓') + Math.abs(Math.round(d.chiDelta||0)) + '</span>';
  const f1CreiEl = document.getElementById('f1-crei-big');
  if (f1CreiEl) f1CreiEl.innerHTML = Math.round(d.crei) + ' <span class="delta-badge ' + (d.creiDelta >= 0 ? 'up' : 'down') + '" style="font-size:9px;vertical-align:middle;">' + (d.creiDelta >= 0 ? '↑' : '↓') + Math.abs(Math.round(d.creiDelta||0)) + '</span>';

  // CHI sub-scores (friendly names)
  const activeScore = Math.round(d.activeRate || 0);
  s('f1-active-score', activeScore);
  s('f1-active-reason', activeScore + '% active in 30d · ' + (activeScore >= 50 ? 'above' : 'below') + ' median (~45%)');
  const hookScore = Math.round(d.hookDiv || 0);
  s('f1-hook-score', hookScore);
  s('f1-hook-reason', (d.typeCombos || 0) + '/5 categories · ' + (hookScore >= 80 ? 'diverse' : hookScore >= 50 ? 'moderate' : 'low'));
  const winnerScore = Math.round(d.outperform || 0);
  s('f1-outperform-score', winnerScore);
  s('f1-outperform-reason', winnerScore + '% beat 21d median · ' + (winnerScore >= 60 ? 'strong' : 'needs work'));
  const refreshScore = Math.round(d.refreshScore || 0);
  s('f1-refresh-score', refreshScore);
  s('f1-refresh-reason', (d.avgWk || 0).toFixed(1) + '/wk · ' + (d.avgWk ? (d.avgWk/3).toFixed(1) + '× median' : '—'));

  // CREI sub-scores (friendly names)
  const momentumScore = Math.round(d.momentum || 0);
  s('f1-momentum-score', momentumScore);
  s('f1-momentum-reason', (d.lastWkNew || 0) + ' new last wk · ' + (momentumScore >= 70 ? 'high output' : momentumScore >= 40 ? 'steady' : 'slow'));
  const engScore = Math.round(d.engagementScore || 0);
  s('f1-engagement-score', engScore);
  s('f1-engagement-reason', 'WoW ' + (d.wow >= 0 ? '+' : '') + Math.round(d.wow || 0) + '% · ' + (d.wow > 5 ? 'growing' : d.wow < -5 ? 'declining' : 'stable'));
  const stabScore = Math.round(d.stability || 0);
  s('f1-stability-score', stabScore);
  s('f1-stability-reason', (d.networkCount || 1) + ' networks · HHI ' + (d.hhi || 0).toFixed(2) + (stabScore >= 70 ? ' (diversified)' : ' (concentrated)'));

  // ── CHARTS — rebuild all with computed data ──
  if (d.vbuckets && chartInstances['c-format']) {
    chartInstances['c-format'].data.datasets[0].data = [
      d.vbuckets['21-30s']||0, d.vbuckets['11-20s']||0,
      d.imageCount||0, d.vbuckets['>30s']||0, d.vbuckets['≤10s']||0
    ];
    // Update tooltip total
    const total = d.totalCreatives || 388;
    chartInstances['c-format'].options.plugins.tooltip.callbacks = {
      label: ctx => ctx.parsed.x + ' creatives (' + Math.round(ctx.parsed.x/total*100) + '% of total)'
    };
    chartInstances['c-format'].update();
  }
  if (d.stages && chartInstances['c-stage']) {
    chartInstances['c-stage'].data.datasets[0].data = [d.stages.Launch, d.stages.Testing, d.stages.Scaling, d.stages.Decay];
    chartInstances['c-stage'].update();
  }
  // Hook chart — update if we have computed hook data
  if (d.hookData && chartInstances['c-hook']) {
    d.hookData.forEach((dataset, i) => {
      if (chartInstances['c-hook'].data.datasets[i]) {
        chartInstances['c-hook'].data.datasets[i].data = dataset;
      }
    });
    chartInstances['c-hook'].update();
  }
  // Trend chart — update with weekly data
  if (d.weeklyCreatives && d.weeklyDownloads && chartInstances['c-trend']) {
    chartInstances['c-trend'].data.labels = d.weekLabels || chartInstances['c-trend'].data.labels;
    chartInstances['c-trend'].data.datasets[0].data = d.weeklyCreatives;
    chartInstances['c-trend'].data.datasets[1].data = d.weeklyDownloads;
    chartInstances['c-trend'].update();
  }

  // Update pills with computed data
  if (d.pills) {
    window._computedPills = d.pills;
    renderPills(activeChart);
  }

  // ── TAB F2: TIMER/HEATMAP ──
  // Timeline
  if (d.weeklyTimeline) {
    const tlEl = document.getElementById('f2-timeline-container');
    if (tlEl) {
      tlEl.innerHTML = d.weeklyTimeline.map(w => `
        <div class="tl-item">
          <div class="tl-dot ${w.isHighest ? 'd-decay' : w.isPeak ? 'd-blitz' : 'd-active'}"></div>
          <div class="tl-body">
            <div class="tl-name">W ${w.label} — ${w.count} new creatives${w.isHighest ? ' ⬆ highest' : w.isPeak ? ' ⬆ peak' : ''}</div>
            <div class="tl-meta">${w.note || ''}</div>
            <div class="tl-tags"><span class="ch-tag hot">Facebook</span><span class="ch-tag">Instagram</span><span class="ch-tag">MAN</span></div>
          </div>
          <div class="tl-spend">${w.count} creatives</div>
        </div>`).join('');
    }
    s('f2-timeline-summary', d.timelineSummary || '');
  }

  // Heatmap — render as proper table (matching mockup Screen 5)
  if (d.channelHeatmap) {
    const hmEl = document.getElementById('f2-heatmap-container');
    if (hmEl) {
      const months = d.channelHeatmap.months || ['Jan','Feb','Mar*'];
      const channels = d.channelHeatmap.channels || [];
      const grandTotal = channels.reduce((s, ch) => s + (ch.total || 0), 0);
      const hmColors = ['#1d4ed8','#3b82f6','#93c5fd','#dbeafe'];
      function hmLevel(v, max) {
        if (!max || !v) return '';
        const r = v / max;
        if (r > 0.75) return 'background:#1d4ed8;color:#fff;';
        if (r > 0.5) return 'background:#3b82f6;color:#fff;';
        if (r > 0.25) return 'background:#93c5fd;color:#1e40af;';
        return 'background:#dbeafe;color:#1d4ed8;';
      }
      const allMax = Math.max(...channels.flatMap(ch => ch.values));
      // "All Networks" totals row
      const allTotals = months.map((_, i) => channels.reduce((s, ch) => s + (ch.values[i] || 0), 0));
      hmEl.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:11px;">
        <thead><tr>
          <th style="text-align:left;padding:4px 6px;font-weight:600;color:var(--t2);font-size:10px;">Ad Network</th>
          ${months.map(m => `<th style="padding:4px 6px;font-weight:600;color:var(--t2);font-size:10px;text-align:center;">${m} (Imp)</th>`).join('')}
          <th style="padding:4px 6px;font-weight:600;color:var(--t2);font-size:10px;text-align:center;">Total</th>
          <th style="padding:4px 6px;font-weight:600;color:var(--t2);font-size:10px;text-align:center;">Share</th>
        </tr></thead>
        <tbody>
          <tr style="background:#f0f3ff;font-weight:600;">
            <td style="padding:4px 6px;font-weight:700;color:var(--accent);">All Networks</td>
            ${allTotals.map(v => `<td style="padding:4px 6px;text-align:center;">${fmtNum(v)}</td>`).join('')}
            <td style="padding:4px 6px;text-align:center;color:var(--accent);"><strong>${fmtNum(grandTotal)}</strong></td>
            <td style="padding:4px 6px;text-align:center;"><strong>100%</strong></td>
          </tr>
          ${channels.map(ch => {
            const share = grandTotal > 0 ? Math.round(ch.total / grandTotal * 100) : 0;
            return `<tr>
              <td style="padding:4px 6px;font-weight:500;color:#374151;">${ch.name}</td>
              ${ch.values.map(v => `<td style="padding:4px 6px;text-align:center;"><span style="display:inline-block;padding:4px 6px;border-radius:3px;font-weight:600;font-size:10px;${hmLevel(v, allMax)}">${fmtNum(v)}</span></td>`).join('')}
              <td style="padding:4px 6px;text-align:center;font-weight:600;">${fmtNum(ch.total)}</td>
              <td style="padding:4px 6px;text-align:center;${share > 50 ? 'font-weight:700;' : ''}">${share}%</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
    }
  }

  // F2 combo chart
  if (d.weeklyCreatives && d.weeklyDownloads && f2ChartInited) {
    const c = chartInstances['c-f2-dl'] || Chart.getChart('c-f2-dl');
    if (c) {
      c.data.labels = d.weekLabels || c.data.labels;
      c.data.datasets[0].data = d.weeklyCreatives;
      c.data.datasets[1].data = d.weeklyDownloads;
      c.update();
    }
  }

  // ── SYNC LABEL + BADGE ──
  if (d.appName) {
    s('sync-label', (d._isUploaded ? 'Real data · ' : '') + d.appName);
    s('active-comp-name', d.appName);
    const badge = document.getElementById('data-badge');
    if (badge) {
      if (d._isUploaded) { badge.textContent = 'Uploaded'; badge.classList.remove('demo'); }
    }
    if (d._isUploaded) {
      document.querySelectorAll('.comp-chip').forEach(c => c.classList.remove('active'));
    }
  }

  // ── COMPARISON TABLE ──
  updateCompTable(d);

  // ── DYNAMIC CREATIVE GRID ──
  if (d._creatives) renderCreativeGrid(d._creatives);

  // ── DELTA TRACKING (localStorage) ──
  if (d.appName && d.chi && d.crei) {
    const key = 'ad-intel-delta-' + d.appName.replace(/\s+/g,'-');
    const prev = JSON.parse(localStorage.getItem(key) || 'null');
    if (prev) {
      const chiD = d.chi - prev.chi;
      const creiD = d.crei - prev.crei;
      if (chiD !== 0) s('s-chi', 'Active rate ' + Math.round(d.activeRate||0) + '% · vs last: ' + (chiD>=0?'+':'') + chiD.toFixed(1));
      if (creiD !== 0) s('s-crei', 'WoW ' + (d.wow>=0?'+':'') + Math.round(d.wow||0) + '% · vs last: ' + (creiD>=0?'+':'') + creiD.toFixed(1));
    }
    localStorage.setItem(key, JSON.stringify({ chi: d.chi, crei: d.crei, ts: Date.now() }));
  }

  // ── BUILD 12: Network & Trends ──
  renderF2CreativeTrends(d);

  // ── BUILD 13: Playbook ──
  updatePlaybook(d);

  // ── BUILD 17: Remove skeleton ──
  removeSkeletonStates();
}

// ── COMPARISON TABLE UPDATER ──
function updateCompTable(activeData) {
  const tbody = document.getElementById('cmp-tbody');
  if (!tbody || !activeData) return;

  // Get all 3 app data objects
  const apps = Object.keys(compDataFull);
  const activeApp = activeData.appName || apps[0];

  // Build ordered list: active first, then others
  const appList = [];
  const activeIdx = apps.indexOf(activeApp);
  if (activeIdx >= 0) {
    appList.push({ name: activeApp, d: compDataFull[activeApp] });
    apps.forEach((a, i) => { if (i !== activeIdx) appList.push({ name: a, d: compDataFull[a] }); });
  } else {
    // Uploaded app not in watchlist — use uploaded data as app1
    appList.push({ name: activeApp, d: activeData });
    apps.forEach(a => appList.push({ name: a, d: compDataFull[a] }));
  }

  // Only show 3 apps max
  const a = appList.slice(0, 3);

  // Set headers
  for (let i = 0; i < 3; i++) {
    const nameEl = document.getElementById('cmp-name-app' + (i+1));
    if (nameEl) nameEl.textContent = a[i]?.name || '—';
  }

  // Define metrics
  const metrics = [
    { key: 'chi', fmt: v => Math.round(v||0), higher: true },
    { key: 'crei', fmt: v => Math.round(v||0), higher: true },
    { key: 'dl', fmt: v => fmtNum(v), valKey: 'dlTotal', higher: true },
    { key: 'rev', fmt: v => fmtMoney(v), valKey: 'revTotal', higher: true },
    { key: 'creatives', fmt: v => (v||0).toLocaleString('en-US'), valKey: 'activeNow', higher: true },
    { key: 'networks', fmt: v => v||0, valKey: 'networkCount', higher: true },
    { key: 'avgwk', fmt: v => (v||0).toFixed(1), valKey: 'avgWk', higher: true },
    { key: 'trend', fmt: v => v||'—', valKey: 'dlTrend', higher: false },
  ];

  metrics.forEach(m => {
    const vals = a.map(app => {
      const d = app?.d || {};
      return m.valKey ? d[m.valKey] : d[m.key];
    });
    const numVals = vals.map(v => typeof v === 'number' ? v : parseFloat(String(v)) || 0);
    const maxVal = m.higher ? Math.max(...numVals) : null;

    for (let i = 0; i < 3; i++) {
      const el = document.getElementById('cmp-' + m.key + '-app' + (i+1));
      if (!el) continue;
      const formatted = m.fmt(vals[i]);
      const isWinner = m.higher && numVals[i] === maxVal && numVals.filter(v => v === maxVal).length === 1;
      el.innerHTML = formatted + (isWinner ? ' <span class="cmp-winner-badge">★</span>' : '');
    }
  });
}

// ── DYNAMIC CREATIVE GRID WITH PAGINATION ──
window._gridPage = 1;
window._gridPageSize = 12;

function renderCreativeGrid(creatives, page) {
  const grid = document.querySelector('.creative-grid');
  if (!grid || !creatives || !creatives.length) return;

  if (page) window._gridPage = page;
  const currentPage = window._gridPage || 1;
  const pageSize = window._gridPageSize || 12;

  // Get current filter/sort state
  const sortSel = document.querySelector('.sort-sel');
  const sortBy = sortSel ? sortSel.value : 'Duration (longest)';

  // Sort
  let sorted = [...creatives];
  if (sortBy === 'Duration (longest)') sorted.sort((a,b) => b.dur - a.dur);
  else if (sortBy === 'Duration (newest)') sorted.sort((a,b) => a.dur - b.dur);
  else if (sortBy === 'First Seen') sorted.sort((a,b) => (b.firstSeen||'').localeCompare(a.firstSeen||''));
  else if (sortBy === 'Type') sorted.sort((a,b) => (a.type||'').localeCompare(b.type||''));

  // Apply select-based filters
  const fNetwork = document.getElementById('f1-filter-network')?.value;
  const fPlatform = document.getElementById('f1-filter-platform')?.value;
  const fFormat = document.getElementById('f1-filter-format')?.value;
  const fTag = document.getElementById('f1-filter-tag')?.value;
  const fQuality = document.getElementById('f1-filter-quality')?.value;

  if (fNetwork) sorted = sorted.filter(c => (c.networks || '').includes(fNetwork));
  if (fPlatform) sorted = sorted.filter(c => (c.platform || '').toLowerCase() === fPlatform);
  if (fFormat) sorted = sorted.filter(c => (c.type || '').toLowerCase() === fFormat);
  if (fTag) sorted = sorted.filter(c => c.tags && c.tags.some(t => t === fTag));
  if (fQuality) sorted = sorted.filter(c => (c.quality || 'average') === fQuality);

  // Paginate
  const totalFiltered = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  const stageColors = { Launch: 'launch', Testing: 'testing', Scaling: 'scaling', Decay: 'decay' };
  const gradients = [
    'linear-gradient(135deg,#f0effe,#e4e2f8)',
    'linear-gradient(135deg,#e8f5e9,#c8e6c9)',
    'linear-gradient(135deg,#fff3e0,#ffe0b2)',
    'linear-gradient(135deg,#e3f2fd,#bbdefb)',
  ];

  grid.innerHTML = items.map((c, i) => {
    const thumbBg = c.thumbnail_url
      ? 'background:url(' + c.thumbnail_url + ') center/cover no-repeat, ' + gradients[i%4]
      : 'background:' + gradients[i%4];
    // Display title: prefer title, fallback to readable filename from ID
    const displayTitle = c.title || (c.id || '').replace(/[-_]/g, ' ').slice(0, 28) || 'Untitled';
    // Format dates
    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'2-digit' }) : '';
    const dateRange = c.firstSeen ? fmtDate(c.firstSeen) + (c.lastSeen ? ' – ' + fmtDate(c.lastSeen) : '') : '';
    return `
    <div class="cc">
      <div class="cc-thumb" style="${thumbBg};">
        ${!c.thumbnail_url ? '<svg class="cc-thumb-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' : ''}
        ${c.vidDur ? '<span class="cc-dur">' + (c.vidDur < 60 ? '00:' + Math.round(c.vidDur).toString().padStart(2,'0') : Math.floor(c.vidDur/60) + ':' + Math.round(c.vidDur%60).toString().padStart(2,'0')) + '</span>' : ''}
        <span class="cc-type ${c.type}">${c.type}</span>
        <span class="cc-stage ${stageColors[c.stage]||'decay'}">${c.stage}</span>
      </div>
      <div class="cc-meta">
        <div class="cc-title">${displayTitle}</div>
        <div class="cc-desc">${c.network || c.networks || 'Unknown'}</div>
        <div class="cc-metrics">
          <div class="ccm"><div class="ccm-label">Life Cycle</div><div class="ccm-val" style="color:${c.dur > 60 ? 'var(--coral)' : c.dur > 21 ? 'var(--amber)' : 'var(--green)'};">${c.dur}d</div></div>
          ${c.vidDur ? '<div class="ccm"><div class="ccm-label">Video dur.</div><div class="ccm-val">' + c.vidDur.toFixed(1) + 's</div></div>' : ''}
        </div>
        ${dateRange ? '<div style="font-size:9px;color:var(--t3);margin-top:2px;font-family:var(--fm);">' + dateRange + '</div>' : ''}
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;" id="cc-tags-${c.id}">
          ${c.tags ? c.tags.map(t => '<span class="ctag ctag-hook">' + t + '</span>').join('') : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  // Update count + pagination controls
  const countEl = document.getElementById('f1-grid-count');
  if (countEl) countEl.textContent = (start + 1) + '–' + (start + items.length) + ' of ' + totalFiltered + ' · sorted by ' + sortBy.toLowerCase();

  // Render pagination
  const paginationEl = document.getElementById('f1-pagination');
  if (paginationEl) {
    paginationEl.innerHTML = `
      <button class="card-btn" ${safePage <= 1 ? 'disabled' : ''} onclick="renderCreativeGrid(window.parsedCreatives, ${safePage - 1})" style="font-size:11px;padding:4px 10px;">← Prev</button>
      <span style="font-family:var(--fm);font-size:11px;color:var(--t2);">Page ${safePage} of ${totalPages}</span>
      <button class="card-btn" ${safePage >= totalPages ? 'disabled' : ''} onclick="renderCreativeGrid(window.parsedCreatives, ${safePage + 1})" style="font-size:11px;padding:4px 10px;">Next →</button>
    `;
  }
}

function applyCreativeFilters() {
  if (window.parsedCreatives) renderCreativeGrid(window.parsedCreatives, 1);
}

// ── ACTION QUEUE CHECKBOXES ──
document.addEventListener('click', e => {
  const aq = e.target.closest('.aq-item');
  if (!aq) return;
  aq.classList.toggle('aq-done');
  // Persist
  const allItems = [...document.querySelectorAll('.aq-item')];
  const doneState = allItems.map(item => item.classList.contains('aq-done'));
  localStorage.setItem('ad-intel-aq-state', JSON.stringify(doneState));
});
// Restore on load
function restoreAqState() {
  const saved = JSON.parse(localStorage.getItem('ad-intel-aq-state') || '[]');
  const allItems = [...document.querySelectorAll('.aq-item')];
  saved.forEach((done, i) => { if (done && allItems[i]) allItems[i].classList.add('aq-done'); });
}

// ── EXPORT WEEKLY REPORT ──
function exportReport() {
  const appName = document.getElementById('active-comp-name')?.textContent || 'Unknown';
  const chi = document.getElementById('v-chi')?.textContent || '—';
  const crei = document.getElementById('v-crei')?.textContent || '—';
  const dl = document.getElementById('v-imp')?.textContent || '—';
  const rev = document.getElementById('v-rev')?.textContent || '—';
  const trend = document.getElementById('v-dl')?.textContent || '—';
  const signal = document.getElementById('ov-signal-headline')?.textContent || '—';

  const md = `# Weekly Ad Intelligence Report
**App:** ${appName}
**Date:** ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}

## Key Metrics
| Metric | Value |
|--------|-------|
| CHI | ${chi} |
| CREI | ${crei} |
| Total Downloads | ${dl} |
| Revenue | ${rev} |
| DL Trend | ${trend} |

## Signal
${signal}

## Action Items
${[...document.querySelectorAll('.aq-item')].map(item => {
  const done = item.classList.contains('aq-done') ? 'x' : ' ';
  const action = item.querySelector('.aq-action')?.textContent || '';
  return '- [' + done + '] ' + action;
}).join('\n')}

---
*Generated by ZPS Ad Intelligence Tool*
`;

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = appName.replace(/\s+/g, '-') + '-report-' + new Date().toISOString().slice(0,10) + '.md';
  a.click();
  URL.revokeObjectURL(url);
}

// ── UPLOAD PANEL TOGGLE ──
function toggleUpload() {
  const p = document.getElementById('upload-panel');
  p.classList.toggle('open');
}

// ── FILE UPLOAD HANDLER ──
const uploadedFiles = { cg: null, dch: null, dl: null };

function handleFile(input, key) {
  const file = input.files[0];
  if (!file) return;
  uploadedFiles[key] = file;
  const slot = document.getElementById('slot-' + key);
  const status = document.getElementById('status-' + key);
  slot.classList.add('loaded');
  status.textContent = '✓ ' + file.name.slice(0, 30) + (file.name.length > 30 ? '…' : '');
  // Enable button if all 3 uploaded
  const allLoaded = uploadedFiles.cg && uploadedFiles.dch && uploadedFiles.dl;
  document.getElementById('analyze-btn').disabled = !allLoaded;
}

// ── CSV PARSER (browser-side, handles utf-16 BOM) ──
function parseCSV(text, sep) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const headers = lines[0].split(sep).map(h => h.replace(/^"|"$/g,'').trim());
  return lines.slice(1).map(line => {
    const vals = line.split(sep).map(v => v.replace(/^"|"$/g,'').replace(/,/g,'').trim());
    const obj = {};
    headers.forEach((h,i) => obj[h] = vals[i] || '');
    return obj;
  });
}

function readFileText(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.readAsText(file, 'UTF-16');
  });
}
function readFileTextUTF8(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.readAsText(file, 'UTF-8');
  });
}

// ── MAIN ANALYSIS FUNCTION ──
async function analyzeUploads() {
  const btn = document.getElementById('analyze-btn');
  btn.textContent = 'Analyzing…';
  btn.disabled = true;

  try {
    // Read files
    const cgText  = await readFileText(uploadedFiles.cg);
    const dchText = await readFileTextUTF8(uploadedFiles.dch);
    const dlText  = await readFileText(uploadedFiles.dl);

    // Parse — detect separator
    const cgSep  = cgText.includes('\t') ? '\t' : ',';
    const dlSep  = dlText.includes('\t') ? '\t' : ',';
    const cg  = parseCSV(cgText, cgSep);
    const dch = parseCSV(dchText, ',');
    const dl  = parseCSV(dlText, dlSep);

    if (!cg.length || !dch.length || !dl.length) {
      alert('Could not parse one or more files. Please check file format.');
      btn.textContent = 'Analyze & update tool'; btn.disabled = false; return;
    }

    // ── Compute metrics ──
    // Unique creatives
    const seen = new Set();
    const uc = cg.filter(r => { if (seen.has(r['Creative URL'])) return false; seen.add(r['Creative URL']); return true; });
    const totalC = uc.length;

    // App name from first row
    const appName = cg[0]?.['Advertiser App Name'] || 'Unknown App';

    // Date range
    const firstSeens = uc.map(r => r['First Seen']).filter(Boolean).sort();
    const lastSeens  = uc.map(r => r['Last Seen']).filter(Boolean).sort();
    const dataEnd = lastSeens[lastSeens.length-1];

    // Active run rate (last_seen within 7 days of data end)
    const dataEndDate = new Date(dataEnd);
    const activeNow = uc.filter(r => {
      const ls = new Date(r['Last Seen']);
      return (dataEndDate - ls) / 86400000 <= 7;
    }).length;

    // Duration
    const durations = uc.map(r => parseInt(r['Duration'])||0);
    const medianDur = durations.sort((a,b)=>a-b)[Math.floor(durations.length/2)];

    // Stage counts
    const stages = {Launch:0, Testing:0, Scaling:0, Decay:0};
    uc.forEach(r => {
      const d = parseInt(r['Duration'])||0;
      if (d<7) stages.Launch++; else if(d<21) stages.Testing++; else if(d<60) stages.Scaling++; else stages.Decay++;
    });

    // Video duration buckets
    const vbuckets = {'≤10s':0,'11-20s':0,'21-30s':0,'>30s':0};
    uc.filter(r=>r['Type']==='video').forEach(r => {
      const s = parseFloat(r['Video Duration'])||0;
      if(s<=10) vbuckets['≤10s']++; else if(s<=20) vbuckets['11-20s']++; else if(s<=30) vbuckets['21-30s']++; else vbuckets['>30s']++;
    });

    // Downloads from dl
    const dlTotal = dl.reduce((s,r) => s+(parseInt(r['Downloads'])||0), 0);
    const revTotal = dl.reduce((s,r) => s+(parseFloat(r['Revenue ($)'])||0), 0);

    // Top countries
    const cxDL = {}, cxRev = {};
    dl.forEach(r => {
      const c = r['Country / Region']||'Unknown';
      cxDL[c] = (cxDL[c]||0)+(parseInt(r['Downloads'])||0);
      cxRev[c] = (cxRev[c]||0)+(parseFloat(r['Revenue ($)'])||0);
    });

    // Channel totals from dch
    const cols = Object.keys(dch[0]).slice(1);
    const chTotals = {};
    cols.forEach(c => { chTotals[c] = dch.reduce((s,r)=>s+(parseFloat(r[c])||0),0); });
    const chSum = Object.values(chTotals).reduce((a,b)=>a+b,0);

    // HHI & stability
    const shares = Object.values(chTotals).map(v=>v/chSum);
    const hhi = shares.reduce((s,v)=>s+v*v,0);
    const stability = (1-hhi)*100;

    // CHI
    const active30d = uc.filter(r => {
      const fs = new Date(r['First Seen']);
      const ls = new Date(r['Last Seen']);
      return (dataEndDate-fs)/86400000 <= 30 && (dataEndDate-ls)/86400000 <= 3;
    }).length;
    const total30d = uc.filter(r => (dataEndDate - new Date(r['First Seen']))/86400000 <= 30).length;
    const activeRate = total30d > 0 ? active30d/total30d*100 : 0;
    const outperform = uc.filter(r=>(parseInt(r['Duration'])||0)>21).length/totalC*100;
    const typeCombos = new Set(uc.map(r=>r['Type']+'_'+(r['Dimensions']||'unk'))).size;
    const hookDiv = Math.min(typeCombos/5,1)*100;

    // Weekly creative count — group by Monday-start weeks
    const wkCounts = {};
    uc.forEach(r => {
      if (!r['First Seen']) return;
      const d2 = new Date(r['First Seen']);
      // Get Monday of this week
      const day = d2.getDay();
      const mon = new Date(d2);
      mon.setDate(d2.getDate() - ((day + 6) % 7));
      const wk = mon.toISOString().slice(0,10);
      wkCounts[wk] = (wkCounts[wk]||0)+1;
    });
    const numWeeks = Math.max(Object.keys(wkCounts).length, 1);
    const avgWk = Object.values(wkCounts).reduce((a,b)=>a+b,0)/numWeeks;
    const refreshScore = Math.min(avgWk/3,1)*100;
    const chi = Math.round((activeRate*0.30 + hookDiv*0.25 + outperform*0.25 + refreshScore*0.20)*10)/10;

    // CREI — momentum from last week new creatives
    const sortedWks = Object.keys(wkCounts).sort();
    const lastWkNew = sortedWks.length >= 2 ? wkCounts[sortedWks[sortedWks.length-2]] : 0;
    const momentum = Math.min(lastWkNew/3*1.5,1.5)/1.5*100;

    // WoW downloads
    const dchByWeek = {};
    dch.forEach(r => {
      const d = new Date(r['Date']);
      const wk = Math.floor((d-new Date('2026-01-01'))/604800000);
      dchByWeek[wk] = (dchByWeek[wk]||0)+Object.values(chTotals).reduce((s,_,i)=>{
        return s+(parseFloat(r[cols[i]])||0);
      },0);
    });
    const wkKeys = Object.keys(dchByWeek).map(Number).sort();
    const wLast = dchByWeek[wkKeys[wkKeys.length-2]]||1;
    const wPrev = dchByWeek[wkKeys[wkKeys.length-3]]||1;
    const wow = (wLast-wPrev)/wPrev*100;
    const engagementScore = 1/(1+Math.exp(-wow/20))*100;
    const crei = Math.round((momentum*0.40 + engagementScore*0.35 + stability*0.25)*10)/10;

    // ── COMPUTE WEEKLY DATA for charts/timeline ──
    const wkArr = Object.entries(wkCounts).sort((a,b) => a[0].localeCompare(b[0]));
    const weekLabels = wkArr.map(([d3]) => {
      const mon = new Date(d3);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      const mStr = mon.toLocaleString('en',{month:'short'});
      const sStr = sun.toLocaleString('en',{month:'short'});
      return mStr === sStr
        ? mStr + ' ' + mon.getDate() + '–' + sun.getDate()
        : mStr + ' ' + mon.getDate() + '–' + sStr + ' ' + sun.getDate();
    });
    const weeklyCreatives = wkArr.map(([,v]) => v);

    // Weekly downloads from dch
    const wkDlData = {};
    dch.forEach(r => {
      const d2 = new Date(r['Date']);
      const wkLabel = d2.toISOString().slice(0,10);
      const rowTotal = cols.reduce((s2,c2) => s2 + (parseFloat(r[c2])||0), 0);
      const wkKey = wkLabel.slice(0,7); // group by rough week
      wkDlData[wkKey] = (wkDlData[wkKey]||0) + rowTotal;
    });
    const weeklyDownloads = Object.values(wkDlData).map(v => +(v/1000).toFixed(1));

    // Monthly channel data for heatmap
    const monthlyChannel = {};
    dch.forEach(r => {
      const month = new Date(r['Date']).toLocaleString('en',{month:'short'});
      if (!monthlyChannel[month]) monthlyChannel[month] = {};
      cols.forEach(c2 => {
        monthlyChannel[month][c2] = (monthlyChannel[month][c2]||0) + (parseFloat(r[c2])||0);
      });
    });
    const heatmapMonths = Object.keys(monthlyChannel);
    const channelHeatmap = {
      months: heatmapMonths,
      channels: cols.map(ch => ({
        name: ch,
        values: heatmapMonths.map(m => monthlyChannel[m]?.[ch] || 0),
        total: chTotals[ch] || 0
      }))
    };

    // Top countries
    const topCountries = Object.entries(cxDL).sort((a,b) => b[1]-a[1]).map(([code,dl2]) => ({
      code: code.length > 3 ? code.slice(0,2).toUpperCase() : code,
      dl: dl2
    }));
    const topCountryConcentration = topCountries.length >= 2
      ? ((topCountries[0].dl + topCountries[1].dl) / dlTotal * 100).toFixed(1)
      : '100';

    // Country revenue map
    const countryRevMap = {};
    const countryDlMap = {};
    Object.entries(cxRev).forEach(([c2,v]) => { countryRevMap[c2.length > 3 ? c2.slice(0,2).toUpperCase() : c2] = v; });
    Object.entries(cxDL).forEach(([c2,v]) => { countryDlMap[c2.length > 3 ? c2.slice(0,2).toUpperCase() : c2] = v; });

    // Monthly downloads for trend
    const monthlyDl = {};
    dl.forEach(r => {
      const m = new Date(r['Date'] || r['Week'] || '').toLocaleString('en',{month:'short'});
      if (m) monthlyDl[m] = (monthlyDl[m]||0) + (parseInt(r['Downloads'])||0);
    });

    // Top channel
    const topChEntry = Object.entries(chTotals).sort((a,b) => b[1]-a[1])[0];
    const topChannel = topChEntry ? { name: topChEntry[0], pct: Math.round(topChEntry[1]/chSum*100) } : null;

    // Weekly timeline for F2
    const weeklyTimeline = wkArr.slice(-7).reverse().map(([d2,count], i) => {
      const maxWk = Math.max(...weeklyCreatives);
      const mon = new Date(d2);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      const label = mon.toLocaleDateString('en',{month:'short',day:'numeric'}) + '–' + sun.toLocaleDateString('en',{month:'short',day:'numeric'});
      return {
        label,
        count,
        isHighest: count === maxWk && i > 0,
        isPeak: count > (avgWk * 1.2) && count !== maxWk,
        note: i === 0 ? 'Most recent week' : ''
      };
    });

    const imageCount = uc.filter(r => r['Type'] === 'image').length;
    const videoCount = totalC - imageCount;
    const videoPct = Math.round(videoCount/totalC*100);

    // DL trend
    const monthDlArr = Object.entries(monthlyDl);
    let dlTrend = '—', dlTrendDir = 'neutral', dlTrendSub = '';
    if (monthDlArr.length >= 2) {
      const prev = monthDlArr[monthDlArr.length-2][1];
      const curr = monthDlArr[monthDlArr.length-1][1];
      const pctChange = Math.round((curr-prev)/prev*100);
      dlTrend = (pctChange >= 0 ? '↑ ' : '↓ ') + Math.abs(pctChange) + '%';
      dlTrendDir = pctChange >= 0 ? 'up' : 'down';
      dlTrendSub = monthDlArr.map(([m,v]) => m + ' ' + fmtNum(v)).join(' → ');
    }

    // Generate insight pills from computed data
    const computedPills = {
      format: [
        { cls: 'warn', text: 'Video 21-30s dominant (' + (vbuckets['21-30s']||0) + ' creatives, ' + Math.round((vbuckets['21-30s']||0)/totalC*100) + '%)' },
        { cls: 'alert', text: 'Image format (' + imageCount + ' creatives, ' + Math.round(imageCount/totalC*100) + '%)' },
        { cls: 'good', text: 'Video ngắn ≤10s: ' + (vbuckets['≤10s']||0) + ' creatives (' + Math.round((vbuckets['≤10s']||0)/totalC*100) + '%)' },
        { cls: 'info', text: 'Video >30s: ' + (vbuckets['>30s']||0) + ' creatives' },
      ],
      stage: [
        { cls: 'alert', text: stages.Decay + '/' + totalC + ' creatives (' + Math.round(stages.Decay/totalC*100) + '%) ở Decay (>60d)' },
        { cls: 'warn', text: stages.Launch + ' creatives Launch <7d' },
        { cls: 'info', text: stages.Scaling + ' creatives đang Scaling (21-60d)' },
        { cls: 'good', text: stages.Testing + ' creatives Testing (7-21d)' },
      ],
      hook: PILLS.hook, // keep default until we have hook classification
      trend: [
        { cls: 'alert', text: 'Downloads ' + dlTrend + ' — creative volume ' + (avgWk||0).toFixed(0) + '/wk' },
        { cls: 'warn', text: 'Peak launch: ' + Math.max(...weeklyCreatives) + ' creatives in 1 week' },
        { cls: 'info', text: 'Consistent ~' + Math.round(avgWk) + ' creatives/tuần' },
        { cls: 'good', text: 'Refresh rate ' + (avgWk||0).toFixed(1) + '/tuần = ' + (avgWk/3).toFixed(1) + '× casual median' },
      ],
    };

    // ── UPDATE ALL UI via single function ──
    updateAllUI({
      chi, crei, activeRate, outperform, hookDiv: hookDiv, refreshScore, avgWk,
      momentum, engagementScore, stability, hhi, wow,
      lastWkNew, typeCombos,
      chiDelta: 0, creiDelta: 0, // no delta on first upload
      dlTotal, revTotal, totalCreatives: totalC, activeNow,
      stages, vbuckets, imageCount,
      dlTotalFmt: fmtNum(dlTotal),
      revFmt: fmtMoney(revTotal),
      dlTrend, dlTrendDir, dlTrendSub,
      period: firstSeens[0]?.slice(0,10) + ' – ' + dataEnd?.slice(0,10),
      revSub: (function() {
        const topRev = Object.entries(countryRevMap).sort((a,b) => b[1]-a[1]).slice(0,2);
        return topRev.map(([c,v]) => c + ': ' + Math.round(v/(revTotal||1)*100) + '%').join(' · ');
      })(),
      revBreakdown: (function() {
        const topRev = Object.entries(countryRevMap).sort((a,b) => b[1]-a[1]).slice(0,2);
        return topRev.map(([c,v]) => c + ' ' + fmtMoney(v)).join(' · ');
      })(),
      networkCount: new Set(cols).size > 1 ? cols.length : 1,
      networkNames: cols.length > 1 ? cols.slice(0,3).join(', ') : 'Meta only',
      appName,
      topCountries, countryRev: countryRevMap, countryDl: countryDlMap,
      topChannel,
      monthlyDlSummary: dlTrendSub,
      countryInsight: topCountries.length >= 2
        ? topCountries[0].code + ': ' + Math.round(topCountries[0].dl/dlTotal*100) + '% DL. ' + topCountries[1].code + ': ' + Math.round(topCountries[1].dl/dlTotal*100) + '% DL. Concentration: ' + topCountryConcentration + '%'
        : '',
      weekLabels, weeklyCreatives, weeklyDownloads,
      weeklyTimeline,
      timelineSummary: 'Avg ' + Math.round(avgWk) + ' creatives/week — ' + (avgWk > 15 ? 'high volume testing' : 'moderate pace'),
      channelHeatmap,
      pills: computedPills,
      signalHeadline: 'Downloads ' + dlTrend + ' dù creative volume cao: ' + Math.round(avgWk) + ' creatives/tuần',
      signalDetail: 'CREI ' + crei + ' · CHI ' + chi + ' · ' + (wow >= 0 ? 'positive' : 'negative') + ' WoW momentum (' + Math.round(wow) + '%). ' + (stages.Decay > totalC * 0.3 ? stages.Decay + ' creatives in decay (' + Math.round(stages.Decay/totalC*100) + '%) — cần audit.' : ''),
      _isUploaded: true,
      _creatives: uc.map(r => ({
        id: (r['Creative URL']||'').split('/').pop() || r['Creative URL'] || Math.random().toString(36).slice(2),
        title: r['Title'] || null,
        url: r['Creative URL'] || '',
        thumbnail_url: r['Thumbnail URL'] || r['Preview Image'] || null,
        type: r['Type'] || 'video',
        network: r['Network'] || r['Ad Network'] || '',
        platform: r['Platform'] || '',
        dur: parseInt(r['Duration'])||0,
        stage: (parseInt(r['Duration'])||0) < 7 ? 'Launch' : (parseInt(r['Duration'])||0) < 21 ? 'Testing' : (parseInt(r['Duration'])||0) < 60 ? 'Scaling' : 'Decay',
        vidDur: parseFloat(r['Video Duration']) || null,
        firstSeen: r['First Seen'] || '',
        lastSeen: r['Last Seen'] || '',
        tags: [],
      })),
    });

    // Store parsed creatives for grid rendering
    window.parsedCreatives = uc.map(r => ({
      id: (r['Creative URL']||'').split('/').pop() || r['Creative URL'] || Math.random().toString(36).slice(2),
      title: r['Title'] || null,
      url: r['Creative URL'] || '',
      thumbnail_url: r['Thumbnail URL'] || r['Preview Image'] || null,
      type: r['Type'] || 'video',
      network: r['Network'] || r['Ad Network'] || '',
      platform: r['Platform'] || '',
      dur: parseInt(r['Duration'])||0,
      stage: (parseInt(r['Duration'])||0) < 7 ? 'Launch' : (parseInt(r['Duration'])||0) < 21 ? 'Testing' : (parseInt(r['Duration'])||0) < 60 ? 'Scaling' : 'Decay',
      vidDur: parseFloat(r['Video Duration']) || null,
      firstSeen: r['First Seen'] || '',
      lastSeen: r['Last Seen'] || '',
      tags: [],
    }));

    btn.textContent = '✓ Tool updated with real data';
    setTimeout(() => {
      toggleUpload();
      btn.textContent = 'Analyze & update tool'; btn.disabled = false;
    }, 2000);

  } catch(err) {
    console.error(err);
    alert('Analysis error: ' + err.message);
    btn.textContent = 'Analyze & update tool'; btn.disabled = false;
  }
}

// ── DROPDOWN TOGGLE ──
function toggleDrop(id) {
  const wrap = document.getElementById(id);
  const isOpen = wrap.classList.contains('open');
  // close all
  document.querySelectorAll('.fdrop-wrap.open').forEach(w => w.classList.remove('open'));
  if (!isOpen) wrap.classList.add('open');
}
// close on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.fdrop-wrap')) {
    document.querySelectorAll('.fdrop-wrap.open').forEach(w => w.classList.remove('open'));
  }
});
function filterUpdate() {
  // placeholder — will filter grid when real data is connected
  // update active state on fdrop button
  document.querySelectorAll('.fdrop-wrap').forEach(wrap => {
    const checked = wrap.querySelectorAll('input:checked').length;
    const total   = wrap.querySelectorAll('input').length;
    const btn = wrap.querySelector('.fdrop');
    if (checked > 0 && checked < total) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

// ── BRAINSTORM TOGGLE ──
function toggleBrainstorm() {
  document.getElementById('brainstorm-panel').classList.toggle('open');
}

// ── F2 CHART INIT ──
let f2ChartInited = false;
function initF2Chart() {
  if (f2ChartInited || !document.getElementById('c-f2-dl')) return;
  f2ChartInited = true;

  const labels = ['W1 Jan','W2 Jan','W3 Jan','W4 Jan','W1 Feb','W2 Feb','W3 Feb','W4 Feb','W1 Mar','W2 Mar','W3 Mar'];
  const newCreatives = [17, 18, 12, 34, 20, 19, 25, 16, 20, 19, 24];
  const downloads    = [28.6, 24.0, 26.4, 31.3, 30.4, 22.5, 24.4, 21.7, 19.8, 19.7, 18.8];

  const ctx = document.getElementById('c-f2-dl').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'New creatives',
          data: newCreatives,
          backgroundColor: labels.map((_, i) => i < 5 ? 'rgba(77,101,255,0.65)' : 'rgba(77,101,255,0.4)'),
          borderRadius: 3,
          yAxisID: 'y',
          order: 2,
        },
        {
          label: 'Downloads (K)',
          data: downloads,
          type: 'line',
          borderColor: 'rgba(224,64,64,0.9)',
          backgroundColor: 'transparent',
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: labels.map((_, i) => i < 5 ? 'rgba(77,101,255,1)' : 'rgba(224,64,64,1)'),
          borderWidth: 2,
          yAxisID: 'y2',
          order: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af', boxWidth: 10, padding: 14 } },
        tooltip: {
          backgroundColor: '#101320',
          titleFont: { family: 'DM Mono', size: 10 },
          bodyFont:  { family: 'Inter, DM Sans', size: 11 },
          padding: 10, cornerRadius: 6,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'DM Mono', size: 8 }, color: '#9ca3af' }
        },
        y: {
          position: 'left',
          grid: { color: '#f3f4f6' },
          title: { display: true, text: 'New creatives', font: { family: 'DM Mono', size: 8 }, color: '#9ca3af' },
          ticks: { stepSize: 5, font: { family: 'DM Mono', size: 8 }, color: '#9ca3af' },
        },
        y2: {
          position: 'right',
          grid: { display: false },
          title: { display: true, text: 'Downloads (K)', font: { family: 'DM Mono', size: 8 }, color: '#9ca3af' },
          ticks: { font: { family: 'DM Mono', size: 8 }, color: '#9ca3af' },
        }
      }
    }
  });
}

// ── SELECTCOMP update for demo vs real ──
const compDataFull = {
  'Conquian Zingplay': {
    chi: 67.5, crei: 72.2, activeRate: 43, outperform: 62, hookDiv: 100, refreshScore: 58,
    momentum: 100, engagementScore: 48, stability: 68, hhi: 0.32, wow: -4.7,
    lastWkNew: 24, typeCombos: 5, avgWk: 20.2,
    chiDelta: -2.7, creiDelta: 1.8,
    dlTotal: 283600, revTotal: 109000, totalCreatives: 388, activeNow: 126,
    stages: { Launch: 78, Testing: 89, Scaling: 61, Decay: 160 },
    vbuckets: { '≤10s': 23, '11-20s': 72, '21-30s': 171, '>30s': 44 },
    imageCount: 78, networkCount: 1, networkNames: 'Meta only',
    dlTotalFmt: '283.6K', revFmt: '$109K',
    dlTrend: '↓ 15%', dlTrendDir: 'down', dlTrendSub: 'Jan 119K → Feb 101K → Mar 83K',
    period: 'Jan–Mar 2026',
    revSub: 'US: 84% · MX: 15%', revBreakdown: 'US $91.9K · MX $16.7K',
    dlPaceSub: '↓15% MoM · pace ~63K Mar',
    appName: 'Conquian Zingplay',
    topCountries: [
      { code: 'MX', dl: 195619 }, { code: 'US', dl: 86996 },
      { code: 'SV', dl: 331 }, { code: 'GT', dl: 204 }, { code: 'AR', dl: 173 }
    ],
    countryRev: { US: 91900, MX: 16700 },
    countryDl: { US: 86996, MX: 195619 },
    topChannel: { name: 'Meta (FB + IG + MAN)', pct: 84 },
    monthlyDlSummary: 'Jan 119K → Feb 101K → Mar pace 83K',
    countryInsight: 'MX: 69% downloads nhưng 15% revenue. US: 31% downloads nhưng 84% revenue. RPD gap ~12×.',
    signalHeadline: 'Downloads ↓15% dù creative volume cao: 20 creatives/tuần',
    signalDetail: 'CREI 72.2 · CHI 67.5 · negative WoW momentum (-5%). 160 creatives in decay (41%) — cần audit.',
    weekLabels: ['W1 Jan','W2 Jan','W3 Jan','W4 Jan','W1 Feb','W2 Feb','W3 Feb','W4 Feb','W1 Mar','W2 Mar','W3 Mar'],
    weeklyCreatives: [17, 18, 12, 34, 20, 19, 25, 16, 20, 19, 24],
    weeklyDownloads: [28.6, 24.0, 26.4, 31.3, 30.4, 22.5, 24.4, 21.7, 19.8, 19.7, 18.8],
    weeklyTimeline: [
      { label: 'Mar 10', count: 24, isHighest: false, isPeak: true, note: 'Most recent complete week' },
      { label: 'Mar 3', count: 19, isHighest: false, isPeak: false, note: '' },
      { label: 'Feb 24', count: 20, isHighest: false, isPeak: false, note: '' },
      { label: 'Feb 17', count: 16, isHighest: false, isPeak: false, note: '' },
      { label: 'Feb 10', count: 25, isHighest: false, isPeak: true, note: '' },
      { label: 'Feb 3', count: 19, isHighest: false, isPeak: false, note: '' },
      { label: 'Jan 27', count: 34, isHighest: true, isPeak: false, note: '' },
    ],
    timelineSummary: 'Avg 20 creatives/week — high volume testing',
    channelHeatmap: {
      months: ['Jan','Feb','Mar*'],
      channels: [
        { name: 'Meta (FB + IG + MAN)', values: [95000, 78000, 65000], total: 238000 },
        { name: 'Google UAC', values: [8000, 7000, 6000], total: 21000 },
        { name: 'TikTok Ads', values: [5000, 4000, 3000], total: 12000 },
        { name: 'AppLovin', values: [3200, 2800, 2400], total: 8400 },
        { name: 'Unity Ads', values: [2000, 1700, 1500], total: 5200 },
      ]
    },
    pills: {
      format: [
        { cls: 'warn', text: 'Video 21-30s dominant (171, 44%)' },
        { cls: 'alert', text: 'Image format (78, 20%)' },
        { cls: 'good', text: 'Video ngắn ≤10s: 23 (6%)' },
        { cls: 'info', text: 'Video >30s: 44 creatives' },
      ],
      stage: [
        { cls: 'alert', text: '160/388 (41%) ở Decay (>60d)' },
        { cls: 'warn', text: '78 creatives Launch <7d' },
        { cls: 'info', text: '61 creatives đang Scaling' },
        { cls: 'good', text: '89 creatives Testing' },
      ],
      hook: [
        { cls: 'good', text: 'Social proof CTR ↑23% vs avg' },
        { cls: 'info', text: 'Gameplay demo: 45% of all creatives' },
        { cls: 'warn', text: 'FOMO/Urgency underused (8%)' },
      ],
      trend: [
        { cls: 'alert', text: 'Downloads ↓15% — creative volume 20/wk' },
        { cls: 'warn', text: 'Peak launch: 34 creatives in W4 Jan' },
        { cls: 'info', text: 'Consistent ~20 creatives/tuần' },
        { cls: 'good', text: 'Refresh rate 20.2/tuần = 6.7× casual median' },
      ],
    },
  },
  'Zynga Poker': {
    chi: 78, crei: 65, activeRate: 55, outperform: 72, hookDiv: 80, refreshScore: 70,
    momentum: 60, engagementScore: 55, stability: 75, hhi: 0.28, wow: 2.1,
    lastWkNew: 15, typeCombos: 4, avgWk: 12.5,
    chiDelta: 3.2, creiDelta: -1.5,
    dlTotal: 1200000, revTotal: 4800000, totalCreatives: 600, activeNow: 210,
    stages: { Launch: 95, Testing: 130, Scaling: 85, Decay: 290 },
    vbuckets: { '≤10s': 60, '11-20s': 120, '21-30s': 240, '>30s': 80 },
    imageCount: 100, networkCount: 3, networkNames: 'Meta, TikTok, Google',
    dlTotalFmt: '1.2M', revFmt: '$4.8M',
    dlTrend: '↑ 6%', dlTrendDir: 'up', dlTrendSub: 'Stable growth Q1',
    period: 'Jan–Mar 2026 (demo)',
    revSub: 'US: 65% · BR: 12%', revBreakdown: 'US $3.1M · BR $576K',
    dlPaceSub: '↑6% MoM · ~420K/month',
    appName: 'Zynga Poker',
    topCountries: [
      { code: 'US', dl: 480000 }, { code: 'BR', dl: 180000 },
      { code: 'TR', dl: 120000 }, { code: 'DE', dl: 96000 }, { code: 'UK', dl: 72000 }
    ],
    countryRev: { US: 3120000, BR: 576000 },
    countryDl: { US: 480000, BR: 180000 },
    topChannel: { name: 'Meta (FB + IG)', pct: 38 },
    monthlyDlSummary: 'Stable ~400K/month',
    countryInsight: 'US: 40% DL + 65% revenue. Diversified across 5+ markets.',
    signalHeadline: 'Downloads ↑6% with mature creative portfolio: CHI 78',
    signalDetail: 'CREI 65 · CHI 78 · positive WoW momentum (+2%). Strong active rate 55% — creative health good.',
    weekLabels: ['W1 Jan','W2 Jan','W3 Jan','W4 Jan','W1 Feb','W2 Feb','W3 Feb','W4 Feb','W1 Mar','W2 Mar','W3 Mar'],
    weeklyCreatives: [10, 12, 14, 11, 13, 12, 15, 11, 12, 14, 13],
    weeklyDownloads: [38.5, 40.2, 39.8, 41.0, 40.5, 39.2, 41.8, 40.0, 42.1, 43.0, 42.5],
    weeklyTimeline: [
      { label: 'Mar 10', count: 13, isHighest: false, isPeak: false, note: 'Most recent complete week' },
      { label: 'Mar 3', count: 14, isHighest: false, isPeak: true, note: '' },
      { label: 'Feb 24', count: 12, isHighest: false, isPeak: false, note: '' },
      { label: 'Feb 17', count: 11, isHighest: false, isPeak: false, note: '' },
      { label: 'Feb 10', count: 15, isHighest: true, isPeak: false, note: '' },
      { label: 'Feb 3', count: 12, isHighest: false, isPeak: false, note: '' },
      { label: 'Jan 27', count: 11, isHighest: false, isPeak: false, note: '' },
    ],
    timelineSummary: 'Avg 12.5 creatives/week — steady cadence',
    channelHeatmap: {
      months: ['Jan','Feb','Mar*'],
      channels: [
        { name: 'Meta (FB + IG)', values: [152000, 158000, 146000], total: 456000 },
        { name: 'Google UAC', values: [120000, 124000, 118000], total: 362000 },
        { name: 'TikTok Ads', values: [80000, 84000, 78000], total: 242000 },
        { name: 'AppLovin', values: [40000, 42000, 38000], total: 120000 },
        { name: 'Unity Ads', values: [8000, 7000, 5000], total: 20000 },
      ]
    },
    pills: {
      format: [
        { cls: 'warn', text: 'Video 21-30s dominant (240, 40%)' },
        { cls: 'info', text: '11-20s: 120 creatives (20%)' },
        { cls: 'alert', text: 'Image format (100, 17%)' },
        { cls: 'good', text: 'Short ≤10s growing: 60 (10%)' },
      ],
      stage: [
        { cls: 'alert', text: '290/600 (48%) ở Decay (>60d)' },
        { cls: 'good', text: '130 creatives Testing — strong pipeline' },
        { cls: 'warn', text: '95 creatives Launch <7d' },
        { cls: 'info', text: '85 creatives Scaling' },
      ],
      hook: [
        { cls: 'good', text: 'Gameplay demo: 52% of creatives' },
        { cls: 'info', text: 'Social proof: 18% — strong CTR' },
        { cls: 'warn', text: 'Challenge/Puzzle: only 5%' },
      ],
      trend: [
        { cls: 'good', text: 'Downloads ↑6% — steady growth' },
        { cls: 'info', text: '~12.5 creatives/wk — consistent cadence' },
        { cls: 'warn', text: 'Creative refresh 4.2× median — moderate' },
        { cls: 'alert', text: '48% in decay — needs pruning' },
      ],
    },
  },
  'Coin Master': {
    chi: 58, crei: 92, activeRate: 38, outperform: 45, hookDiv: 90, refreshScore: 65,
    momentum: 95, engagementScore: 88, stability: 82, hhi: 0.22, wow: 8.5,
    lastWkNew: 35, typeCombos: 4, avgWk: 28,
    chiDelta: -4.1, creiDelta: 5.3,
    dlTotal: 3500000, revTotal: 12000000, totalCreatives: 1200, activeNow: 380,
    stages: { Launch: 200, Testing: 280, Scaling: 180, Decay: 540 },
    vbuckets: { '≤10s': 180, '11-20s': 300, '21-30s': 360, '>30s': 120 },
    imageCount: 240, networkCount: 4, networkNames: 'Meta, TikTok, Google, AppLovin',
    dlTotalFmt: '3.5M', revFmt: '$12M',
    dlTrend: '↑ 12%', dlTrendDir: 'up', dlTrendSub: 'Aggressive UA push Q1',
    period: 'Jan–Mar 2026 (demo)',
    revSub: 'US: 35% · UK: 15%', revBreakdown: 'US $4.2M · UK $1.8M',
    dlPaceSub: '↑12% MoM · pace ~1.3M Mar',
    appName: 'Coin Master',
    topCountries: [
      { code: 'US', dl: 875000 }, { code: 'UK', dl: 525000 },
      { code: 'DE', dl: 420000 }, { code: 'FR', dl: 350000 }, { code: 'BR', dl: 280000 }
    ],
    countryRev: { US: 4200000, UK: 1800000 },
    countryDl: { US: 875000, UK: 525000 },
    topChannel: { name: 'Meta (FB + IG)', pct: 45 },
    monthlyDlSummary: '~1.2M/month, growing',
    countryInsight: 'Well diversified: top 5 markets each <25%. US: 25% DL, 35% rev.',
    signalHeadline: 'Downloads ↑12% with aggressive UA: 28 creatives/tuần, 4 networks',
    signalDetail: 'CREI 92 · CHI 58 · strong WoW momentum (+9%). High volume but 45% decay — creative health needs attention.',
    weekLabels: ['W1 Jan','W2 Jan','W3 Jan','W4 Jan','W1 Feb','W2 Feb','W3 Feb','W4 Feb','W1 Mar','W2 Mar','W3 Mar'],
    weeklyCreatives: [22, 28, 30, 35, 25, 32, 28, 26, 30, 35, 32],
    weeklyDownloads: [95.2, 100.5, 105.8, 112.0, 108.5, 115.2, 120.0, 118.4, 125.0, 130.2, 128.8],
    weeklyTimeline: [
      { label: 'Mar 10', count: 32, isHighest: false, isPeak: true, note: 'Most recent complete week' },
      { label: 'Mar 3', count: 35, isHighest: true, isPeak: false, note: '' },
      { label: 'Feb 24', count: 30, isHighest: false, isPeak: true, note: '' },
      { label: 'Feb 17', count: 26, isHighest: false, isPeak: false, note: '' },
      { label: 'Feb 10', count: 28, isHighest: false, isPeak: false, note: '' },
      { label: 'Feb 3', count: 32, isHighest: false, isPeak: true, note: '' },
      { label: 'Jan 27', count: 35, isHighest: true, isPeak: false, note: '' },
    ],
    timelineSummary: 'Avg 28 creatives/week — aggressive testing pace',
    channelHeatmap: {
      months: ['Jan','Feb','Mar*'],
      channels: [
        { name: 'Meta (FB + IG)', values: [525000, 560000, 490000], total: 1575000 },
        { name: 'Google UAC', values: [280000, 295000, 260000], total: 835000 },
        { name: 'TikTok Ads', values: [210000, 220000, 195000], total: 625000 },
        { name: 'AppLovin', values: [105000, 110000, 98000], total: 313000 },
        { name: 'Snapchat', values: [55000, 50000, 47000], total: 152000 },
      ]
    },
    pills: {
      format: [
        { cls: 'warn', text: 'Video 21-30s dominant (360, 30%)' },
        { cls: 'info', text: '11-20s: 300 creatives (25%)' },
        { cls: 'alert', text: 'Image heavy: 240 (20%)' },
        { cls: 'good', text: 'Short ≤10s: 180 (15%) — TikTok native' },
      ],
      stage: [
        { cls: 'alert', text: '540/1200 (45%) ở Decay — high burn rate' },
        { cls: 'good', text: '280 Testing — massive pipeline' },
        { cls: 'warn', text: '200 Launch <7d — aggressive refresh' },
        { cls: 'info', text: '180 Scaling — solid mid-funnel' },
      ],
      hook: [
        { cls: 'good', text: 'Win/Reward reveal: 38% — highest CTR' },
        { cls: 'info', text: 'FOMO/Urgency: 22% — drives installs' },
        { cls: 'warn', text: 'Social proof: only 8%' },
      ],
      trend: [
        { cls: 'good', text: 'Downloads ↑12% — strong momentum' },
        { cls: 'info', text: '28 creatives/wk = 9.3× casual median' },
        { cls: 'warn', text: '4 networks — diversified UA' },
        { cls: 'alert', text: '45% decay — high churn, needs audit' },
      ],
    },
  },
};

function selectComp(btn, name) {
  document.querySelectorAll('.comp-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('active-comp-name').textContent = name;
  const d = compDataFull[name]; if (!d) return;
  updateAllUI(d);
  // Mark as demo if not Conquian
  if (name !== 'Conquian Zingplay') {
    const badge = document.getElementById('data-badge');
    if (badge) { badge.textContent = 'Demo data'; badge.classList.add('demo'); }
  }
}

// ══════════════════════════════════════════════════════════════
// API-POWERED FEATURES (Build 8)
// ══════════════════════════════════════════════════════════════

// Current watchlist state
window.watchlistApps = [];
window.activeAppId = null;

// ── SEARCH HANDLER ──
function handleSearchInput(query) {
  const dropdown = document.getElementById('search-dropdown');
  const results = document.getElementById('search-results');
  const loading = document.getElementById('search-loading');
  const empty = document.getElementById('search-empty');

  if (!query || query.trim().length < 2) {
    dropdown.style.display = 'none';
    return;
  }

  dropdown.style.display = 'block';
  loading.style.display = 'block';
  empty.style.display = 'none';
  results.innerHTML = '';

  window.api.searchAppsDebounced(query, (apps, err) => {
    loading.style.display = 'none';
    if (err || apps.length === 0) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    results.innerHTML = apps.map(app => `
      <div class="search-result-item" onclick="handleAddApp(${JSON.stringify(app).replace(/"/g, '&quot;')})" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid #f3f4f6;">
        <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#4d65ff,#7c3aed);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0;">
          ${app.icon_url ? `<img src="${app.icon_url}" style="width:36px;height:36px;border-radius:8px;" onerror="this.style.display='none';this.parentElement.textContent='${(app.app_name || '?')[0]}'">` : (app.app_name || '?')[0]}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${app.app_name || 'Unknown'}</div>
          <div style="font-size:11px;color:#6b7280;">${app.publisher || ''} · ${app.platform || ''}</div>
        </div>
        <button class="card-btn" style="font-size:11px;padding:4px 10px;">Add +</button>
      </div>
    `).join('');
  });
}

// Close search dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('search-dropdown');
  const searchBox = document.querySelector('.search-box');
  if (dropdown && searchBox && !searchBox.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// ── ADD APP TO WATCHLIST ──
async function handleAddApp(app) {
  const dropdown = document.getElementById('search-dropdown');
  const input = document.getElementById('app-search-input');
  dropdown.style.display = 'none';
  input.value = '';

  try {
    const added = await window.api.addToWatchlist(app);
    // Trigger sync for the new app
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) { syncBtn.textContent = 'Syncing...'; syncBtn.disabled = true; }

    await window.api.syncApp(added.id);

    if (syncBtn) { syncBtn.textContent = 'Sync API'; syncBtn.disabled = false; }

    // Reload watchlist
    await loadWatchlist();

    // Select the newly added app
    selectAppById(added.id);
  } catch (err) {
    console.error('Failed to add app:', err);
    alert('Failed to add app: ' + err.message);
  }
}

// ── LOAD WATCHLIST FROM API ──
async function loadWatchlist() {
  try {
    const apps = await window.api.getWatchlist();
    window.watchlistApps = apps;
    renderWatchlistChips(apps);

    // If no active app, select the first one
    if (apps.length > 0 && !window.activeAppId) {
      selectAppById(apps[0].id);
    }
  } catch (err) {
    console.error('Failed to load watchlist:', err);
    // Fallback to demo data if API unavailable
    console.warn('Falling back to demo data');
  }
}

// ── RENDER WATCHLIST CHIPS ──
const CHIP_COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function renderWatchlistChips(apps) {
  const container = document.getElementById('watchlist-chips');
  if (!container) return;

  if (apps.length === 0) {
    container.innerHTML = '<span style="font-size:11px;color:#9ca3af;">No apps yet — search to add</span>';
    return;
  }

  container.innerHTML = apps.map((app, i) => {
    const color = app.color || CHIP_COLORS[i % CHIP_COLORS.length];
    const isActive = app.id === window.activeAppId;
    return `
      <button class="comp-chip ${isActive ? 'active' : ''}" onclick="selectAppById('${app.id}')" data-app-id="${app.id}">
        <span class="comp-dot" style="background:${color}"></span>
        ${app.app_name}
        <span class="chip-genre">${app.latest_snapshot ? fmtNum(app.latest_snapshot.downloads) + ' DLs' : 'Not synced'}</span>
      </button>
    `;
  }).join('');
}

// ── SELECT APP BY ID ──
function selectAppById(appId) {
  window.activeAppId = appId;
  const app = window.watchlistApps.find(a => a.id === appId);
  if (!app) return;

  // Update chip active states
  document.querySelectorAll('.comp-chip').forEach(c => c.classList.remove('active'));
  const activeChip = document.querySelector(`.comp-chip[data-app-id="${appId}"]`);
  if (activeChip) activeChip.classList.add('active');

  // Update topbar
  const nameEl = document.getElementById('active-comp-name');
  if (nameEl) nameEl.textContent = app.app_name;

  const syncLabel = document.getElementById('sync-label');
  if (syncLabel) {
    const synced = app.last_synced_at ? new Date(app.last_synced_at).toLocaleDateString() : 'Never';
    syncLabel.textContent = `Last sync: ${synced}`;
  }

  // Update badge
  const badge = document.getElementById('data-badge');
  if (badge) { badge.textContent = 'API'; badge.classList.remove('demo'); }

  // If we have a snapshot, convert to the format updateAllUI expects
  if (app.latest_snapshot) {
    const snapshot = app.latest_snapshot;
    const uiData = snapshotToUIData(app, snapshot);
    updateAllUI(uiData);
  }

  // Fetch creatives from API for the grid (with thumbnails + titles)
  if (window.api && window.api.getCreatives) {
    window.api.getCreatives(appId, { limit: 200 }).then(data => {
      const creatives = data.creatives || data.results || data.data || [];
      if (!creatives.length) return;

      const now = Date.now();
      window.parsedCreatives = creatives.map(c => {
        const firstSeen = c.first_seen ? new Date(c.first_seen) : null;
        const lastSeen = c.last_seen ? new Date(c.last_seen) : null;
        const dur = firstSeen ? Math.round((now - firstSeen.getTime()) / (1000 * 60 * 60 * 24)) : 0;
        return {
          id: c.sensor_tower_creative_id || c.id || '',
          title: c.title || null,
          url: c.preview_url || '',
          thumbnail_url: c.thumbnail_url || null,
          type: c.format || 'video',
          network: c.network || '',
          platform: c.platform || '',
          dur,
          stage: c.status === 'testing' ? 'Testing' : c.status === 'scaling' ? 'Scaling' : c.status === 'decay' ? 'Decay' : dur < 7 ? 'Launch' : dur < 21 ? 'Testing' : dur < 60 ? 'Scaling' : 'Decay',
          vidDur: c.duration_seconds || null,
          firstSeen: c.first_seen || '',
          lastSeen: c.last_seen || '',
          tags: (c.creative_tags || c.tags || []).filter(t => t.tag_type === 'hook' || typeof t === 'string').map(t => typeof t === 'string' ? t : t.tag_value),
          quality: c.quality || null,
        };
      });
      renderCreativeGrid(window.parsedCreatives, 1);
    }).catch(err => console.warn('Failed to load creatives:', err));
  }
}

// ── CONVERT SUPABASE SNAPSHOT → UI DATA FORMAT ──
// Maps API snapshot to the compDataFull format that updateAllUI() expects
function snapshotToUIData(app, snapshot) {
  return {
    chi: snapshot.chi_score || 0,
    crei: snapshot.crei_score || 0,
    totalDL: snapshot.downloads || 0,
    dlTrend: 0, // TODO: compute from previous snapshot
    revenue: (snapshot.revenue_cents || 0) / 100,
    totalCreatives: snapshot.total_creatives || 0,
    activeCreatives: snapshot.active_creatives || 0,
    networks: snapshot.networks_count || 0,
    primaryNetwork: snapshot.primary_network || '—',
    // Stages — will be populated from creatives API
    stages: { launch: 0, testing: 0, scaling: 0, decay: 0 },
    // Placeholders for sections that need creatives data
    videoBuckets: {},
    signalHeadline: snapshot.chi_score < 50 ? 'Low creative health — needs attention' : 'Creative pipeline healthy',
    signalDetail: `CHI ${snapshot.chi_score || 0} · ${snapshot.active_creatives || 0}/${snapshot.total_creatives || 0} active`,
    pills: [],
    chiDelta: 0,
    creiDelta: 0,
    dlPaceSub: '',
  };
}

// ── SYNC ALL ──
async function handleSyncAll() {
  const btn = document.getElementById('sync-btn');
  const dot = document.getElementById('sync-dot');
  if (btn) { btn.textContent = 'Syncing...'; btn.disabled = true; }
  if (dot) dot.style.background = '#f59e0b';

  try {
    await window.api.syncAllApps();
    await loadWatchlist();
    // Re-select current app to refresh data
    if (window.activeAppId) selectAppById(window.activeAppId);
    if (btn) btn.textContent = 'Sync API';
    if (dot) dot.style.background = '#10b981';
  } catch (err) {
    console.error('Sync failed:', err);
    if (btn) btn.textContent = 'Sync failed';
    if (dot) dot.style.background = '#ef4444';
    setTimeout(() => { if (btn) { btn.textContent = 'Sync API'; btn.disabled = false; } }, 3000);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ══════════════════════════════════════════════════════════════
// BUILD 9: OVERVIEW COMPARISON CHARTS + MARKET INTELLIGENCE
// ══════════════════════════════════════════════════════════════

const MULTI_APP_COLORS = ['#4d65ff', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

function initOverviewCharts() {
  const apps = Object.keys(compDataFull);
  const appData = apps.map(name => compDataFull[name]);
  if (!appData.length) return;

  // Also use watchlist data if available
  const allApps = window.watchlistApps.length > 0
    ? window.watchlistApps.map(a => ({ name: a.app_name, d: a.latest_snapshot ? snapshotToUIData(a, a.latest_snapshot) : compDataFull[a.app_name] })).filter(a => a.d)
    : apps.map(name => ({ name, d: compDataFull[name] }));

  const labels3m = ['Jan', 'Feb', 'Mar'];

  // Downloads Comparison — grouped bar
  const dlDatasets = allApps.slice(0, 6).map((app, i) => {
    const d = app.d;
    // Estimate monthly from total (split roughly by trend)
    const total = d.dlTotal || 0;
    const monthly = d.weeklyDownloads
      ? splitWeeklyToMonthly(d.weeklyDownloads, 3)
      : [Math.round(total * 0.38), Math.round(total * 0.34), Math.round(total * 0.28)];
    return {
      label: app.name,
      data: monthly.map(v => Math.round(v / 1000)),
      backgroundColor: MULTI_APP_COLORS[i] + 'bb',
      borderRadius: 4,
      borderSkipped: false,
    };
  });

  makeChart('c-ov-dl-compare', 'bar', labels3m, dlDatasets, {
    plugins: {
      legend: { display: true, position: 'bottom', labels: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af', boxWidth: 10, padding: 12 } },
      tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y * 1000) + ' downloads' } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af' } },
      y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => fmtNum(v * 1000), font: { family: 'DM Mono', size: 9 }, color: '#9ca3af' }, beginAtZero: true }
    }
  });

  // Revenue Comparison — grouped bar
  const revDatasets = allApps.slice(0, 6).map((app, i) => {
    const d = app.d;
    const total = d.revTotal || d.revenue || 0;
    const monthly = [Math.round(total * 0.36), Math.round(total * 0.34), Math.round(total * 0.30)];
    return {
      label: app.name,
      data: monthly.map(v => Math.round(v / 1000)),
      backgroundColor: MULTI_APP_COLORS[i] + 'bb',
      borderRadius: 4,
      borderSkipped: false,
    };
  });

  makeChart('c-ov-rev-compare', 'bar', labels3m, revDatasets, {
    plugins: {
      legend: { display: true, position: 'bottom', labels: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af', boxWidth: 10, padding: 12 } },
      tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtMoney(ctx.parsed.y * 1000) } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af' } },
      y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => fmtMoney(v * 1000), font: { family: 'DM Mono', size: 9 }, color: '#9ca3af' }, beginAtZero: true }
    }
  });

  // Creative Volume Trend — multi-line
  const trendDatasets = allApps.slice(0, 6).map((app, i) => {
    const d = app.d;
    return {
      label: app.name,
      data: d.weeklyCreatives || [],
      borderColor: MULTI_APP_COLORS[i],
      backgroundColor: 'transparent',
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: MULTI_APP_COLORS[i],
      borderWidth: 2,
    };
  });

  const trendLabels = allApps[0]?.d?.weekLabels || [];
  makeChart('c-ov-creative-trend', 'line', trendLabels, trendDatasets, {
    plugins: {
      legend: { display: true, position: 'bottom', labels: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af', boxWidth: 10, padding: 12 } },
      tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y + ' creatives' } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 8 }, color: '#9ca3af', maxRotation: 45 } },
      y: { grid: { color: '#f3f4f6' }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af' }, beginAtZero: true }
    }
  });

  // Market Intelligence table
  updateMarketIntel(allApps);
}

function splitWeeklyToMonthly(weekly, months) {
  const perMonth = Math.ceil(weekly.length / months);
  const result = [];
  for (let i = 0; i < months; i++) {
    const slice = weekly.slice(i * perMonth, (i + 1) * perMonth);
    result.push(slice.reduce((s, v) => s + v * 1000, 0));
  }
  return result;
}

function updateOverviewCharts() {
  initOverviewCharts();
}

function toggleChartType(chartId, newType, btn) {
  const chart = chartInstances[chartId];
  if (!chart) return;

  // Update button styles
  const wrap = btn.parentElement;
  wrap.querySelectorAll('.ct-btn').forEach(b => {
    b.style.background = '#fff';
    b.style.color = 'var(--t2)';
    b.style.fontWeight = '400';
    b.classList.remove('ct-active');
  });
  btn.style.background = '#4d65ff';
  btn.style.color = '#fff';
  btn.style.fontWeight = '500';
  btn.classList.add('ct-active');

  // Update chart type
  chart.config.type = newType;
  chart.data.datasets.forEach((ds, i) => {
    const baseColor = MULTI_APP_COLORS[i] || '#4d65ff';
    if (newType === 'line') {
      ds.borderColor = baseColor;
      ds.backgroundColor = 'transparent';
      ds.tension = 0.35;
      ds.pointRadius = 3;
      ds.pointBackgroundColor = baseColor;
      ds.borderWidth = 2;
      delete ds.borderRadius;
      delete ds.borderSkipped;
    } else {
      ds.backgroundColor = baseColor + 'bb';
      ds.borderColor = undefined;
      ds.borderRadius = 4;
      ds.borderSkipped = false;
      ds.tension = undefined;
      ds.pointRadius = undefined;
      ds.pointBackgroundColor = undefined;
      ds.borderWidth = undefined;
    }
  });
  chart.update();
}

function updateMarketIntel(allApps) {
  const tbody = document.getElementById('mi-tbody');
  if (!tbody || !allApps || allApps.length === 0) return;

  // Set headers
  allApps.slice(0, 3).forEach((app, i) => {
    const h = document.getElementById('mi-head-app' + (i + 1));
    if (h) h.innerHTML = '<span class="cmp-app-name">' + app.name + '</span>';
  });

  // Gather all unique countries across apps
  const countryMap = {};
  allApps.slice(0, 3).forEach((app, appIdx) => {
    const tc = app.d?.topCountries || [];
    tc.forEach(c => {
      if (!countryMap[c.code]) countryMap[c.code] = {};
      countryMap[c.code][appIdx] = c.dl;
    });
  });

  // Sort by total downloads across all apps
  const sorted = Object.entries(countryMap)
    .map(([code, vals]) => ({ code, vals, total: Object.values(vals).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td class="cmp-metric-label" colspan="4" style="text-align:center;color:var(--t3);">No market data available</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map(row => {
    const vals = [0, 1, 2].map(i => row.vals[i] || 0);
    const maxVal = Math.max(...vals);
    return '<tr>' +
      '<td class="cmp-metric-label">' + row.code + '</td>' +
      vals.map((v, i) => {
        const isMax = v === maxVal && v > 0 && vals.filter(x => x === maxVal).length === 1;
        const cls = i === 0 ? 'cmp-active-val' : 'cmp-val';
        return '<td class="' + cls + '">' + fmtNum(v) + (isMax ? ' <span class="cmp-winner-badge">★</span>' : '') + '</td>';
      }).join('') +
      '</tr>';
  }).join('');

  // Insight pills
  const pillsEl = document.getElementById('mi-pills');
  if (pillsEl && allApps.length >= 2) {
    const a1 = allApps[0], a2 = allApps[1];
    const a1Markets = (a1.d?.topCountries || []).length;
    const a2Markets = (a2.d?.topCountries || []).length;
    const pills = [];
    if (a1Markets !== a2Markets) {
      pills.push({ cls: 'info', text: a1.name + ': ' + a1Markets + ' markets vs ' + a2.name + ': ' + a2Markets + ' markets' });
    }
    const a1Top = a1.d?.topCountries?.[0];
    const a2Top = a2.d?.topCountries?.[0];
    if (a1Top && a2Top && a1Top.code !== a2Top.code) {
      pills.push({ cls: 'warn', text: 'Different top markets: ' + a1.name + ' → ' + a1Top.code + ', ' + a2.name + ' → ' + a2Top.code });
    }
    pillsEl.innerHTML = pills.map(p => '<div class="ip ' + p.cls + '"><span class="ip-dot"></span>' + p.text + '</div>').join('');
  }
}

// ══════════════════════════════════════════════════════════════
// BUILD 12: NETWORK & TRENDS — CREATIVE TRENDS + NETWORK TABLE
// ══════════════════════════════════════════════════════════════

function updateF2Charts() {
  if (!f2ChartInited) initF2Chart();
}

function renderF2CreativeTrends(d) {
  if (!d) return;

  // Hook bars
  const hookBars = document.getElementById('f2-hook-bars');
  if (hookBars) {
    const hooks = [
      { name: 'Social Proof', pct: 35, color: '#10b981' },
      { name: 'Gameplay Demo', pct: 28, color: '#3b82f6' },
      { name: 'FOMO / Urgency', pct: 15, color: '#f59e0b' },
      { name: 'Challenge', pct: 12, color: '#8b5cf6' },
      { name: 'Reward Reveal', pct: 10, color: '#ec4899' },
    ];
    hookBars.innerHTML = hooks.map(h =>
      `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:90px;font-family:var(--fm);font-size:10px;color:var(--t2);flex-shrink:0;">${h.name}</div>
        <div style="flex:1;height:18px;background:var(--page);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${h.pct}%;background:${h.color};border-radius:3px;transition:width 0.5s;"></div>
        </div>
        <div style="width:32px;font-family:var(--fd);font-size:10px;font-weight:600;color:var(--t1);text-align:right;">${h.pct}%</div>
      </div>`
    ).join('');
  }

  // Format bars
  const formatBars = document.getElementById('f2-format-bars');
  if (formatBars && d.vbuckets) {
    const total = d.totalCreatives || 1;
    const videoCount = total - (d.imageCount || 0);
    const formats = [
      { name: 'Video', count: videoCount, pct: Math.round(videoCount / total * 100), color: '#4d65ff' },
      { name: 'Image', count: d.imageCount || 0, pct: Math.round((d.imageCount || 0) / total * 100), color: '#10b981' },
    ];
    formatBars.innerHTML = formats.map(f =>
      `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:60px;font-family:var(--fm);font-size:10px;color:var(--t2);flex-shrink:0;">${f.name}</div>
        <div style="flex:1;height:18px;background:var(--page);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${f.pct}%;background:${f.color};border-radius:3px;transition:width 0.5s;"></div>
        </div>
        <div style="width:60px;font-family:var(--fd);font-size:10px;font-weight:500;color:var(--t1);text-align:right;">${f.count} (${f.pct}%)</div>
      </div>`
    ).join('');
  }

  // Stage bars
  const stageBars = document.getElementById('f2-stage-bars');
  if (stageBars && d.stages) {
    const total = d.totalCreatives || 1;
    const stageData = [
      { name: 'Active', count: d.stages.Launch + d.stages.Testing, color: '#10b981' },
      { name: 'Testing', count: d.stages.Testing, color: '#3b82f6' },
      { name: 'Scaling', count: d.stages.Scaling, color: '#4d65ff' },
      { name: 'Decay', count: d.stages.Decay, color: '#ef4444' },
    ];
    stageBars.innerHTML = stageData.map(s =>
      `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:60px;font-family:var(--fm);font-size:10px;color:var(--t2);flex-shrink:0;">${s.name}</div>
        <div style="flex:1;height:18px;background:var(--page);border-radius:3px;overflow:hidden;">
          <div style="height:100%;width:${Math.round(s.count / total * 100)}%;background:${s.color};border-radius:3px;transition:width 0.5s;"></div>
        </div>
        <div style="width:60px;font-family:var(--fd);font-size:10px;font-weight:500;color:var(--t1);text-align:right;">${s.count} (${Math.round(s.count / total * 100)}%)</div>
      </div>`
    ).join('');
  }

  // Hook sparklines (mini bar trends)
  const sparkEl = document.getElementById('f2-hook-sparklines');
  if (sparkEl) {
    const hookTrends = [
      { name: 'Social Proof', values: [32, 35, 38, 40, 42, 45, 48, 50], delta: '+18%' },
      { name: 'Gameplay', values: [30, 28, 25, 22, 20, 18, 16, 15], delta: '-15%' },
      { name: 'FOMO', values: [15, 14, 13, 12, 12, 11, 10, 10], delta: '-5%' },
      { name: 'Challenge', values: [10, 11, 12, 13, 14, 15, 16, 15], delta: '+5%' },
      { name: 'Reward', values: [8, 8, 7, 7, 6, 6, 5, 5], delta: '-3%' },
    ];
    sparkEl.innerHTML = hookTrends.map(h => {
      const max = Math.max(...h.values);
      const bars = h.values.map(v =>
        `<div style="width:8px;height:${Math.round(v / max * 24)}px;background:${h.delta.startsWith('+') ? 'var(--accent)' : 'var(--coral)'};border-radius:2px;"></div>`
      ).join('');
      const isUp = h.delta.startsWith('+');
      return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:80px;font-family:var(--fm);font-size:10px;color:var(--t2);flex-shrink:0;">${h.name}</div>
        <div style="display:flex;align-items:flex-end;gap:2px;height:24px;">${bars}</div>
        <div style="font-family:var(--fd);font-size:10px;font-weight:600;color:${isUp ? 'var(--green)' : 'var(--coral)'};">${h.delta}</div>
      </div>`;
    }).join('');
  }

  // Network pills
  const netPills = document.getElementById('f2-network-pills');
  if (netPills && d.channelHeatmap) {
    const ch = d.channelHeatmap.channels || [];
    const total = ch.reduce((s, c) => s + c.total, 0);
    const topCh = ch[0];
    const pills = [];
    if (topCh && total > 0) {
      const share = Math.round(topCh.total / total * 100);
      if (share > 50) pills.push({ cls: 'warn', text: topCh.name + ' dominates at ' + share + '% — concentration risk' });
      else pills.push({ cls: 'good', text: 'Diversified: top channel ' + topCh.name + ' at ' + share + '%' });
    }
    if (ch.length <= 2) pills.push({ cls: 'alert', text: 'Only ' + ch.length + ' networks — expand to reduce risk' });
    netPills.innerHTML = pills.map(p => '<div class="ip ' + p.cls + '"><span class="ip-dot"></span>' + p.text + '</div>').join('');
  }

  // Render Ad Networks tab insights (Sections 1-3)
  renderF2NetworkInsights(d);
}

const CHANNEL_COLORS = ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

function renderF2NetworkInsights(d) {
  if (!d || !d.channelHeatmap) return;
  const channels = d.channelHeatmap.channels || [];
  const months = d.channelHeatmap.months || [];
  const grandTotal = channels.reduce((s, ch) => s + (ch.total || 0), 0);
  if (!channels.length) return;

  // Compute per-channel MoM
  channels.forEach(ch => {
    const last = ch.values[ch.values.length - 1] || 0;
    const prev = ch.values.length >= 2 ? ch.values[ch.values.length - 2] : last;
    ch._momPct = prev > 0 ? Math.round((last - prev) / prev * 100) : 0;
  });

  // Monthly totals
  const monthTotals = months.map((_, i) => channels.reduce((s, ch) => s + (ch.values[i] || 0), 0));
  const totalMoM = monthTotals.length >= 2 && monthTotals[monthTotals.length - 2] > 0
    ? Math.round((monthTotals[monthTotals.length - 1] - monthTotals[monthTotals.length - 2]) / monthTotals[monthTotals.length - 2] * 100)
    : 0;

  // ── SECTION 1: Network Health Summary ──
  const netCount = d.networkCount || channels.length;
  const hhi = d.hhi || 0;
  const stability = d.stability || 0;

  const kpiNet = document.getElementById('f2-kpi-networks');
  if (kpiNet) {
    const bg = netCount >= 3 ? '#ecfdf5' : netCount === 2 ? '#fef3c7' : '#fef2f2';
    const clr = netCount >= 3 ? '#065f46' : netCount === 2 ? '#92400e' : '#991b1b';
    const lbl = netCount >= 3 ? 'Diversified' : netCount === 2 ? 'Limited' : 'Single-channel risk';
    kpiNet.style.background = bg;
    kpiNet.innerHTML = '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:' + clr + ';font-weight:600;">Active Networks</div>' +
      '<div style="font-size:22px;font-weight:700;color:' + clr + ';margin:4px 0;">' + netCount + '</div>' +
      '<div style="font-size:10px;color:' + clr + ';">' + lbl + '</div>' +
      '<div style="font-size:9px;color:var(--t3);margin-top:2px;">' + (d.networkNames || '') + '</div>';
  }

  const kpiHhi = document.getElementById('f2-kpi-hhi');
  if (kpiHhi) {
    const bg = hhi > 0.5 ? '#fef2f2' : hhi > 0.25 ? '#fef3c7' : '#ecfdf5';
    const clr = hhi > 0.5 ? '#991b1b' : hhi > 0.25 ? '#92400e' : '#065f46';
    const lbl = hhi > 0.5 ? 'Highly concentrated' : hhi > 0.25 ? 'Moderately concentrated' : 'Well spread';
    kpiHhi.style.background = bg;
    kpiHhi.innerHTML = '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:' + clr + ';font-weight:600;">Concentration (HHI)</div>' +
      '<div style="font-size:22px;font-weight:700;color:' + clr + ';margin:4px 0;">' + hhi.toFixed(2) + '</div>' +
      '<div style="font-size:10px;color:' + clr + ';">' + lbl + '</div>' +
      '<div style="font-size:9px;color:var(--t3);margin-top:2px;">Top channel holds ' + (d.topChannel ? d.topChannel.pct : '—') + '%</div>';
  }

  const kpiStab = document.getElementById('f2-kpi-stability');
  if (kpiStab) {
    const bg = stability < 50 ? '#fef2f2' : stability < 70 ? '#fef3c7' : '#ecfdf5';
    const clr = stability < 50 ? '#991b1b' : stability < 70 ? '#92400e' : '#065f46';
    const lbl = stability < 50 ? 'Low diversity' : stability < 70 ? 'Moderate' : 'Strong diversity';
    kpiStab.style.background = bg;
    kpiStab.innerHTML = '<div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:' + clr + ';font-weight:600;">Stability Score</div>' +
      '<div style="font-size:22px;font-weight:700;color:' + clr + ';margin:4px 0;">' + Math.round(stability) + '<span style="font-size:13px;font-weight:500;color:var(--t3);"> /100</span></div>' +
      '<div style="font-size:10px;color:' + clr + ';">' + lbl + '</div>';
  }

  // Summary pills
  const sumPills = document.getElementById('f2-summary-pills');
  if (sumPills) {
    const pills = [];
    if (d.topChannel && d.topChannel.pct > 60) pills.push({ cls: 'alert', text: d.topChannel.name + ' holds ' + d.topChannel.pct + '% — high dependency risk' });
    if (netCount <= 2) pills.push({ cls: 'warn', text: 'Only ' + netCount + ' network' + (netCount > 1 ? 's' : '') + ' active — expand to reduce risk' });
    if (totalMoM > 0) pills.push({ cls: 'good', text: 'Total impressions growing +' + totalMoM + '% MoM' });
    else if (totalMoM < 0) pills.push({ cls: 'alert', text: 'Total impressions declining ' + totalMoM + '% MoM' });
    const growing = channels.filter(ch => ch._momPct > 20);
    growing.forEach(ch => pills.push({ cls: 'info', text: ch.name + ' surging +' + ch._momPct + '% MoM' }));
    sumPills.innerHTML = pills.map(p => '<div class="ip ' + p.cls + '"><span class="ip-dot"></span>' + p.text + '</div>').join('');
  }

  // ── SECTION 2: Channel Mix — Doughnut + Breakdown ──
  const mixColors = channels.map((_, i) => CHANNEL_COLORS[i % CHANNEL_COLORS.length]);
  makeChart('c-f2-channel-mix', 'doughnut', channels.map(ch => ch.name), [{
    data: channels.map(ch => ch.total),
    backgroundColor: mixColors,
    borderWidth: 0,
  }], {
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: function(ctx) { return ctx.label + ': ' + fmtNum(ctx.parsed) + ' (' + Math.round(ctx.parsed / grandTotal * 100) + '%)'; } } },
    },
    scales: {}
  });

  // Breakdown list
  const brkdown = document.getElementById('f2-mix-breakdown');
  if (brkdown) {
    brkdown.innerHTML = channels.map((ch, i) => {
      const share = grandTotal > 0 ? Math.round(ch.total / grandTotal * 100) : 0;
      const arrow = ch._momPct >= 0 ? '↑' : '↓';
      const arrowClr = ch._momPct >= 0 ? 'var(--green)' : 'var(--red)';
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f3f4f6;">' +
        '<div style="width:10px;height:10px;border-radius:50%;background:' + mixColors[i] + ';flex-shrink:0;"></div>' +
        '<div style="flex:1;font-size:12px;color:var(--t1);">' + ch.name + '</div>' +
        '<div style="font-size:13px;font-weight:700;color:var(--t0);">' + share + '%</div>' +
        '<div style="font-size:10px;color:' + arrowClr + ';min-width:40px;text-align:right;">' + arrow + ' ' + Math.abs(ch._momPct) + '%</div>' +
        '</div>';
    }).join('');
  }

  // Mix pills
  const mixPills = document.getElementById('f2-mix-pills');
  if (mixPills) {
    const pills = [];
    const sorted = [...channels].sort((a, b) => b.total - a.total);
    if (sorted.length >= 2) {
      const top2pct = Math.round((sorted[0].total + sorted[1].total) / grandTotal * 100);
      if (top2pct > 80) pills.push({ cls: 'warn', text: 'Top 2 networks = ' + top2pct + '% — reduce concentration' });
    }
    const fastest = [...channels].sort((a, b) => b._momPct - a._momPct);
    if (fastest.length && fastest[0]._momPct > 5) pills.push({ cls: 'good', text: fastest[0].name + ' surging +' + fastest[0]._momPct + '% MoM' });
    const slowest = [...channels].sort((a, b) => a._momPct - b._momPct);
    if (slowest.length && slowest[0]._momPct < -10) pills.push({ cls: 'alert', text: slowest[0].name + ' declining ' + slowest[0]._momPct + '% MoM — investigate' });
    mixPills.innerHTML = pills.map(p => '<div class="ip ' + p.cls + '"><span class="ip-dot"></span>' + p.text + '</div>').join('');
  }

  // ── SECTION 3: Monthly Impression Trend — Stacked Bar ──
  const trendDatasets = channels.map((ch, i) => ({
    label: ch.name,
    data: ch.values,
    backgroundColor: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
    borderRadius: 2,
    borderSkipped: false,
  }));

  makeChart('c-f2-monthly-trend', 'bar', months, trendDatasets, {
    plugins: {
      legend: { display: true, position: 'bottom', labels: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af', boxWidth: 10, padding: 12 } },
      tooltip: { callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + fmtNum(ctx.parsed.y); } } }
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#9ca3af' } },
      y: { stacked: true, grid: { color: '#f3f4f6' }, ticks: { callback: function(v) { return fmtNum(v); }, font: { family: 'DM Mono', size: 9 }, color: '#9ca3af' }, beginAtZero: true }
    }
  });

  // Trend pills
  const trendPills = document.getElementById('f2-trend-pills');
  if (trendPills) {
    const pills = [];
    if (totalMoM >= 0) pills.push({ cls: 'good', text: 'Total impressions +' + totalMoM + '% MoM (' + fmtNum(monthTotals[monthTotals.length - 1]) + ' vs ' + fmtNum(monthTotals[monthTotals.length - 2] || 0) + ')' });
    else pills.push({ cls: 'alert', text: 'Total impressions ' + totalMoM + '% MoM (' + fmtNum(monthTotals[monthTotals.length - 1]) + ' vs ' + fmtNum(monthTotals[monthTotals.length - 2] || 0) + ')' });
    const allDeclining = channels.every(ch => ch._momPct < 0);
    if (allDeclining) pills.push({ cls: 'alert', text: 'All ' + channels.length + ' networks declining — market pullback or budget cut?' });
    trendPills.innerHTML = pills.map(p => '<div class="ip ' + p.cls + '"><span class="ip-dot"></span>' + p.text + '</div>').join('');
  }
}

// Toggle stacked/grouped for monthly trend chart
function toggleF2TrendStack(mode, btn) {
  const chart = chartInstances['c-f2-monthly-trend'];
  if (!chart) return;
  const wrap = btn.parentElement;
  wrap.querySelectorAll('.ct-btn').forEach(b => {
    b.style.background = '#fff'; b.style.color = 'var(--t2)'; b.style.fontWeight = '400';
  });
  btn.style.background = '#4d65ff'; btn.style.color = '#fff'; btn.style.fontWeight = '500';
  const stacked = mode === 'stacked';
  chart.options.scales.x.stacked = stacked;
  chart.options.scales.y.stacked = stacked;
  chart.update();
}

// ══════════════════════════════════════════════════════════════
// BUILD 13: PLAYBOOK — PERFORMANCE SNAPSHOT + DYNAMIC PATTERNS
// ══════════════════════════════════════════════════════════════

function updatePlaybook(d) {
  if (!d) return;
  const s = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  s('pb-dl-val', d.dlTotalFmt || fmtNum(d.dlTotal));
  s('pb-dl-sub', d.dlTrend ? d.dlTrend + ' MoM' : '—');
  s('pb-chi-val', 'CHI ' + Math.round(d.chi || 0));
  const decayPct = d.totalCreatives ? Math.round((d.stages?.Decay || 0) / d.totalCreatives * 100) : 0;
  s('pb-chi-sub', decayPct + '% decay rate');
  s('pb-network-val', (d.networkCount || 1) + ' networks');
  s('pb-network-sub', d.networkCount <= 1 ? 'Single-channel risk' : 'Diversified');
  s('pb-market-val', d.topCountries?.length ? d.topCountries[0].code : '—');

  if (d.countryRev && d.countryDl) {
    const topCode = d.topCountries?.[0]?.code;
    const rev = d.countryRev[topCode] || 0;
    const dl = d.countryDl[topCode] || 1;
    s('pb-market-sub', 'RPD $' + (rev / dl).toFixed(2));
  }

  const headerTitle = document.getElementById('pb-header-title');
  if (headerTitle) headerTitle.textContent = 'Pattern analysis — ' + (d.appName || 'Unknown');
  const headerSub = document.getElementById('pb-header-sub');
  if (headerSub) headerSub.textContent = 'Derived from ' + (d.period || 'latest data') + ' · auto-detected';

  renderPlaybookActions(d);
  renderPlaybookPatterns(d);
}

function renderPlaybookActions(d) {
  const thisWeek = document.getElementById('pb-aq-this-week');
  const next2w = document.getElementById('pb-aq-next-2w');
  const monitor = document.getElementById('pb-aq-monitor');
  const aqItem = (action, outcome) =>
    `<div class="aq-item"><span class="aq-action">${action}</span><span class="aq-outcome">${outcome}</span></div>`;

  if (thisWeek) {
    const items = [];
    if (d.stages?.Decay > (d.totalCreatives || 0) * 0.3)
      items.push(aqItem('Audit creatives >120 days in decay stage', '→ ' + d.stages.Decay + ' creatives need review'));
    if (d.dlTrendDir === 'down')
      items.push(aqItem('Review DL decline — check creative quality & audience saturation', '→ ' + d.dlTrend));
    if (d.chi < 50)
      items.push(aqItem('Urgently improve creative pipeline — CHI critically low', '→ CHI ' + Math.round(d.chi)));
    thisWeek.innerHTML = items.length > 0 ? items.join('') : aqItem('No urgent actions', '✓ Pipeline healthy');
  }
  if (next2w) {
    const items = [];
    if (d.networkCount <= 1)
      items.push(aqItem('Test ads on TikTok or Google UAC', '→ Currently single-channel'));
    items.push(aqItem('Optimize creative volume vs quality ratio', '→ ' + (d.avgWk || 0).toFixed(1) + '/wk refresh'));
    next2w.innerHTML = items.join('');
  }
  if (monitor) {
    monitor.innerHTML = [
      aqItem('Track weekly download trend', '→ ' + (d.dlTrendSub || '—')),
      aqItem('Monitor organic vs paid ratio', '→ ' + (d.topChannel ? d.topChannel.name + ' ' + d.topChannel.pct + '%' : '—')),
    ].join('');
  }
}

function renderPlaybookPatterns(d) {
  const container = document.getElementById('pb-pattern-cards');
  if (!container || !d) return;
  const patterns = [];

  if (d.stages?.Decay > (d.totalCreatives || 0) * 0.3) {
    const dp = Math.round(d.stages.Decay / (d.totalCreatives || 1) * 100);
    patterns.push({ name: 'Creative fatigue: ' + d.stages.Decay + ' creatives (' + dp + '%) in decay', genre: 'All networks · ' + (d.period || ''), severity: 'high',
      metrics: [{ label: 'Decay count', val: d.stages.Decay }, { label: 'Decay %', val: dp + '%', cls: 'outcome-bad' }, { label: 'Active rate', val: Math.round(d.activeRate || 0) + '%' }, { label: 'Risk', val: 'Frequency fatigue', cls: 'outcome-bad' }],
      desc: d.stages.Decay + ' creatives beyond effective lifecycle — frequency fatigue and wasted spend.',
      actions: ['Pause creatives >120 days', 'Set stricter frequency caps: max 3-4×/user/30d', 'Rotate with fresh variants of proven concepts'] });
  }
  if (d.dlTrendDir === 'down' && d.avgWk > 10) {
    patterns.push({ name: 'High volume not driving download growth', genre: (d.period || '') + ' · ' + Math.round(d.avgWk) + '/wk · Downloads declining', severity: 'high',
      metrics: [{ label: 'Volume', val: d.avgWk.toFixed(1) + '/wk' }, { label: 'Median', val: '3/wk' }, { label: 'DL trend', val: d.dlTrend, cls: 'outcome-bad' }, { label: 'Pattern', val: 'Test broad, no scale' }],
      desc: 'Volume ' + (d.avgWk / 3).toFixed(1) + '× median but downloads declining. Volume alone not creating winners.',
      actions: ['Reduce to 6-8/wk, increase budget per creative', 'Set thresholds: X downloads in 7d before scale/kill', 'Test in batches: 3 hooks × 2 formats'] });
  }
  if (d.networkCount <= 1) {
    patterns.push({ name: 'Single network dependency', genre: (d.networkNames || 'Meta only') + ' · ' + (d.period || ''), severity: 'medium',
      metrics: [{ label: 'Networks', val: d.networkCount || 1, cls: 'outcome-bad' }, { label: 'Top channel', val: d.topChannel?.name || '—' }, { label: 'Risk', val: 'CPM exposure' }, { label: 'Opportunity', val: 'TikTok, Google', cls: 'outcome-good' }],
      desc: 'All creatives on single ecosystem. No fallback if CPMs increase.',
      actions: ['Test TikTok with 5-10 creatives', 'Test Google UAC for high-RPD markets', 'Target 20% non-primary spend in 2 months'] });
  }
  if (d.countryRev && d.countryDl && d.topCountries?.length >= 2) {
    const c1 = d.topCountries[0].code, c2 = d.topCountries[1].code;
    const rpd1 = (d.countryRev[c1] || 0) / (d.countryDl[c1] || 1);
    const rpd2 = (d.countryRev[c2] || 0) / (d.countryDl[c2] || 1);
    const gap = Math.max(rpd1, rpd2) / Math.max(Math.min(rpd1, rpd2), 0.01);
    if (gap > 3) {
      const hi = rpd1 > rpd2 ? c1 : c2, lo = rpd1 > rpd2 ? c2 : c1;
      patterns.push({ name: hi + ' vs ' + lo + ' RPD gap: ' + Math.round(gap) + '×', genre: 'RPD analysis · ' + (d.period || ''), severity: 'medium',
        metrics: [{ label: lo + ' DLs', val: fmtNum(d.countryDl[lo]) }, { label: lo + ' RPD', val: '$' + Math.min(rpd1, rpd2).toFixed(2) }, { label: hi + ' DLs', val: fmtNum(d.countryDl[hi]) }, { label: hi + ' RPD', val: '$' + Math.max(rpd1, rpd2).toFixed(2), cls: 'outcome-good' }],
        desc: 'RPD ' + Math.round(gap) + '× higher in ' + hi + '. Same creative strategy for both markets misses revenue opportunity.',
        actions: ['Separate budget for ' + hi + ' (monetization) vs ' + lo + ' (retention)', 'Test ' + hi + '-specific creatives: localized copy', 'Review spend allocation'] });
    }
  }
  if (patterns.length === 0) {
    patterns.push({ name: 'No critical patterns detected', genre: 'All metrics healthy', severity: 'info',
      metrics: [{ label: 'CHI', val: Math.round(d.chi || 0) }, { label: 'CREI', val: Math.round(d.crei || 0) }, { label: 'Status', val: 'Healthy', cls: 'outcome-good' }],
      desc: 'Creative pipeline operating normally. Continue monitoring.', actions: ['Maintain current cadence', 'Review weekly'] });
  }

  const icons = {
    high: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    medium: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  };
  const colors = { high: 'var(--coral)', medium: 'var(--amber)', info: 'var(--accent)' };

  container.innerHTML = patterns.map(p => `
    <div class="pb-card">
      <div class="pb-head">
        <div><div class="pb-name">${p.name}</div><div class="pb-genre">${p.genre}</div></div>
        <div class="conf-ring" style="border-color:${colors[p.severity]};color:${colors[p.severity]};">${icons[p.severity] || ''}</div>
      </div>
      <div class="pb-meta">${p.metrics.map(m => `<div class="pbm"><div class="pbm-label">${m.label}</div><div class="pbm-val ${m.cls || ''}">${m.val}</div></div>`).join('')}</div>
      <div class="pb-desc">${p.desc}</div>
      <div class="pb-tests-label">Recommended actions</div>
      ${p.actions.map(a => `<div class="pb-test">${a}</div>`).join('')}
    </div>`).join('');
}

// ══════════════════════════════════════════════════════════════
// BUILD 14: SETTINGS TAB — WATCHLIST MANAGEMENT + API USAGE
// ══════════════════════════════════════════════════════════════

function updateSettingsTab() {
  const apps = window.watchlistApps || [];
  const container = document.getElementById('settings-watchlist');
  const countEl = document.getElementById('settings-app-count');
  if (countEl) countEl.textContent = apps.length;
  if (!container) return;

  if (apps.length === 0) {
    container.innerHTML = '<div style="padding:20px;text-align:center;font-family:var(--fm);font-size:11px;color:var(--t3);">No apps in watchlist. Use the search bar to add apps.</div>';
    return;
  }

  container.innerHTML = apps.map((app, i) => {
    const color = app.color || CHIP_COLORS[i % CHIP_COLORS.length];
    const synced = app.last_synced_at ? new Date(app.last_synced_at).toLocaleDateString() : 'Never';
    const dl = app.latest_snapshot?.downloads ? fmtNum(app.latest_snapshot.downloads) : '—';
    return `<div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--border);">
      <div style="width:32px;height:32px;border-radius:8px;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">${(app.app_name || '?')[0]}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-family:var(--fd);font-size:12px;font-weight:600;color:var(--t0);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${app.app_name}</div>
        <div style="font-family:var(--fm);font-size:9px;color:var(--t3);">Last sync: ${synced} · ${dl} DLs · ${app.platform || '—'}</div>
      </div>
      <span style="font-family:var(--fm);font-size:8px;padding:2px 6px;border-radius:3px;background:rgba(77,101,255,0.1);color:var(--accent);font-weight:600;">API</span>
      <button class="card-btn" style="font-size:10px;padding:3px 8px;" onclick="handleSyncSingle('${app.id}')">Refresh</button>
      <button class="card-btn" style="font-size:10px;padding:3px 8px;color:var(--coral);border-color:rgba(239,68,68,0.3);" onclick="handleRemoveApp('${app.id}','${(app.app_name || '').replace(/'/g, '\\&#39;')}')">Remove</button>
    </div>`;
  }).join('');
}

async function handleSyncSingle(appId) {
  try {
    await window.api.syncApp(appId);
    await loadWatchlist();
    if (window.activeAppId === appId) selectAppById(appId);
    updateSettingsTab();
  } catch (err) { console.error('Sync failed:', err); }
}

async function handleRemoveApp(appId, appName) {
  if (!confirm('Remove "' + appName + '" from watchlist? All data will be deleted.')) return;
  try {
    await window.api.removeFromWatchlist(appId);
    await loadWatchlist();
    updateSettingsTab();
    if (window.activeAppId === appId) {
      window.activeAppId = null;
      if (window.watchlistApps.length > 0) selectAppById(window.watchlistApps[0].id);
    }
  } catch (err) { alert('Failed to remove: ' + err.message); }
}

// ══════════════════════════════════════════════════════════════
// BUILD 17: POLISH — LOADING STATES + SKELETON SHIMMER
// ══════════════════════════════════════════════════════════════

function showSkeletonStates() {
  ['v-chi', 'v-crei', 'v-imp', 'v-rev', 'v-rank', 'v-sent',
   'ov-total-dl', 'ov-total-rev', 'ov-active-creatives', 'ov-avg-wk'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.textContent === '—') el.classList.add('skeleton-text');
  });
}

function removeSkeletonStates() {
  document.querySelectorAll('.skeleton-text').forEach(el => el.classList.remove('skeleton-text'));
}

// ── INIT: load from API first, fallback to demo data ──
(function initApp() {
  initCharts();
  initF2Chart();
  setTimeout(initOverviewCharts, 100);

  // Try to load from API
  if (window.api) {
    loadWatchlist().then(() => {
      // If no apps in watchlist, show demo data
      if (window.watchlistApps.length === 0) {
        console.log('No watchlist apps — showing demo data');
        updateAllUI(compDataFull['Conquian Zingplay']);
      }
    }).catch(() => {
      // API unavailable — fallback to demo
      console.warn('API unavailable — using demo data');
      updateAllUI(compDataFull['Conquian Zingplay']);
    });
  } else {
    // No API client — pure demo mode
    updateAllUI(compDataFull['Conquian Zingplay']);
  }

  restoreAqState();

  // Sort dropdown → re-render creative grid
  const sortSel = document.querySelector('.sort-sel');
  if (sortSel) sortSel.addEventListener('change', () => {
    if (window.parsedCreatives) renderCreativeGrid(window.parsedCreatives);
  });

  // Filter checkboxes → re-render creative grid
  document.querySelectorAll('.fdrop-wrap input').forEach(inp => {
    inp.addEventListener('change', () => {
      if (window.parsedCreatives) renderCreativeGrid(window.parsedCreatives);
    });
  });
})();
