// ZPS Ad Intelligence — Main JavaScript

function set(id, val, cls) {
  const el = document.getElementById(id); if (!el) return;
  el.textContent = val;
  if (cls) el.className = 'kpi-val ' + cls;
}

function setNavActive(el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

function switchTab(id, btn) {
  document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  if (btn && btn.classList.contains('tab-btn')) btn.classList.add('active');
  // sync sidebar
  const tabToNav = { sum: 0, f1: 1, f2: 2, f3: 3 };
  const navItems = document.querySelectorAll('.sidebar .nav-item');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navItems[tabToNav[id]]) navItems[tabToNav[id]].classList.add('active');
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

// Init charts when F1/F2 tabs are first opened
const origSwitchTab = switchTab;
window.switchTab = function(id, btn) {
  origSwitchTab(id, btn);
  if (id === 'f1' && !chartInstances['c-format']) {
    setTimeout(initCharts, 50);
  }
  if (id === 'f2') setTimeout(initF2Chart, 50);
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
  s('v-chi', d.chi, 'kpi-val ' + (d.chi >= 70 ? 'up' : d.chi >= 50 ? 'warn' : 'down'));
  s('s-chi', d.chiSub || ('Active rate ' + Math.round(d.activeRate||0) + '%'));
  s('v-crei', d.crei, 'kpi-val ' + (d.crei >= 70 ? 'up' : d.crei >= 50 ? 'warn' : 'down'));
  s('s-crei', d.creiSub || ('WoW ' + (d.wow>=0?'+':'') + Math.round(d.wow||0) + '%'));
  s('v-imp', d.dlTotalFmt || (d.dlTotal ? (d.dlTotal/1000).toFixed(1)+'K' : '—'));
  s('s-imp', d.period || 'Jan–Mar 2026');
  s('v-dl', d.dlTrend || '—', 'kpi-val ' + (d.dlTrendDir || 'neutral'));
  s('s-dl', d.dlTrendSub || '');
  s('v-rev', d.revFmt || (d.revTotal ? '$'+(d.revTotal/1000).toFixed(0)+'K' : '—'));
  s('s-rev', d.revSub || '');
  s('v-rank', d.totalCreatives || '—');
  s('s-rank', (d.activeNow||0) + ' active now · ' + (d.networkNames || 'Meta only'));
  s('v-sent', d.networkCount || '—', 'kpi-val ' + (d.networkCount > 1 ? 'neutral' : 'warn'));
  s('s-sent', d.networkNames || 'Meta only');

  // ── TAB OVERVIEW ──
  // Signal banner
  if (d.signalHeadline) s('ov-signal-headline', d.signalHeadline);
  if (d.signalDetail) s('ov-signal-detail', d.signalDetail + ' <span class="signal-link" onclick="switchTab(\'f1\', document.querySelectorAll(\'.tab-btn\')[1])">Xem creative breakdown →</span>');

  // KPI mini cards
  s('ov-total-dl', d.dlTotalFmt || (d.dlTotal ? (d.dlTotal/1000).toFixed(1)+'K' : '—'));
  s('ov-dl-sub', d.dlPaceSub || '');
  s('ov-total-rev', d.revFmt || (d.revTotal ? '$'+(d.revTotal/1000).toFixed(0)+'K' : '—'));
  s('ov-rev-sub', d.revBreakdown || '');
  const activeCreEl = document.getElementById('ov-active-creatives');
  if (activeCreEl) activeCreEl.innerHTML = (d.activeNow||0) + '<span style="font-size:13px;color:var(--t2);font-weight:400;">/' + (d.totalCreatives||0) + '</span>';
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
          <div class="cb-val">${c.dl.toLocaleString()}</div>
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
    s('ov-us-rev', '$' + (usRev/1000).toFixed(1) + 'K');
    s('ov-mx-rev', '$' + (mxRev/1000).toFixed(1) + 'K');
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

  // ── TAB F1: CREATIVE PROFILE ──
  // CHI + CREI big scores
  const f1ChiEl = document.getElementById('f1-chi-big');
  if (f1ChiEl) f1ChiEl.innerHTML = Math.round(d.chi) + ' <span class="delta-badge ' + (d.chiDelta >= 0 ? 'up' : 'down') + '" style="font-size:9px;vertical-align:middle;">' + (d.chiDelta >= 0 ? '↑' : '↓') + Math.abs(Math.round(d.chiDelta||0)) + '</span>';
  const f1CreiEl = document.getElementById('f1-crei-big');
  if (f1CreiEl) f1CreiEl.innerHTML = Math.round(d.crei) + ' <span class="delta-badge ' + (d.creiDelta >= 0 ? 'up' : 'down') + '" style="font-size:9px;vertical-align:middle;">' + (d.creiDelta >= 0 ? '↑' : '↓') + Math.abs(Math.round(d.creiDelta||0)) + '</span>';

  // CHI sub-scores
  s('f1-active-score', Math.round(d.activeRate || 0));
  s('f1-active-reason', Math.round(d.activeRate || 0) + '% active in 30d window');
  s('f1-hook-score', Math.round(d.hookDiv || 0));
  s('f1-hook-reason', (d.typeCombos || 0) + '/5 categories');
  s('f1-outperform-score', Math.round(d.outperform || 0));
  s('f1-outperform-reason', Math.round(d.outperform || 0) + '% > 21d median');
  s('f1-refresh-score', Math.round(d.refreshScore || 0));
  s('f1-refresh-reason', (d.avgWk || 0).toFixed(1) + '/wk avg');

  // CREI sub-scores
  s('f1-momentum-score', Math.round(d.momentum || 0));
  s('f1-momentum-reason', (d.lastWkNew || 0) + ' new last week vs median 3');
  s('f1-engagement-score', Math.round(d.engagementScore || 0));
  s('f1-engagement-reason', 'WoW ' + (d.wow >= 0 ? '+' : '') + Math.round(d.wow || 0) + '%');
  s('f1-stability-score', Math.round(d.stability || 0));
  s('f1-stability-reason', 'HHI ' + (d.hhi || 0).toFixed(2));

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

  // Heatmap
  if (d.channelHeatmap) {
    const hmEl = document.getElementById('f2-heatmap-container');
    if (hmEl) {
      const months = d.channelHeatmap.months || ['Jan','Feb','Mar*'];
      const channels = d.channelHeatmap.channels || [];
      const colors = {
        'Organic Search': { bg: 'rgba(77,101,255,', color: 'var(--accent)' },
        'Paid Display':   { bg: 'rgba(16,185,129,', color: 'var(--green)' },
        'Web Browser':    { bg: 'rgba(59,130,246,', color: 'var(--blue)' },
        'Organic Browse':  { bg: 'rgba(245,158,11,', color: 'var(--amber)' },
        'Paid Search':    { bg: 'rgba(156,163,175,', color: 'var(--t2)' },
      };
      hmEl.innerHTML = `
        <div></div>${months.map(m => `<div class="hm-head">${m}</div>`).join('')}<div class="hm-head">Total</div>
        ${channels.map(ch => {
          const maxVal = Math.max(...ch.values);
          const c = colors[ch.name] || { bg: 'rgba(156,163,175,', color: 'var(--t2)' };
          return `<div class="hm-label">${ch.name}</div>` +
            ch.values.map(v => {
              const opacity = maxVal > 0 ? (v / maxVal * 0.3 + 0.1).toFixed(2) : '0.1';
              return `<div class="hm-cell" style="background:${c.bg}${opacity});color:${c.color};">${(v/1000).toFixed(1)}K</div>`;
            }).join('') +
            `<div class="hm-delta" style="color:var(--t1);font-size:10px;">${(ch.total/1000).toFixed(0)}K</div>`;
        }).join('')}`;
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
    s('sync-label', 'Real data · ' + d.appName);
    s('active-comp-name', d.appName);
    const badge = document.getElementById('data-badge');
    if (badge) { badge.textContent = 'Uploaded'; badge.classList.remove('demo'); }
  }
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

    // Weekly creative count
    const wkCounts = {};
    uc.forEach(r => {
      if (!r['First Seen']) return;
      const d = new Date(r['First Seen']);
      const wk = d.toISOString().slice(0,10);
      wkCounts[wk] = (wkCounts[wk]||0)+1;
    });
    const avgWk = Object.values(wkCounts).reduce((a,b)=>a+b,0)/Math.max(Object.keys(wkCounts).length,1);
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
    const weekLabels = wkArr.map(([d]) => { const dt = new Date(d); return 'W' + Math.ceil(dt.getDate()/7) + ' ' + dt.toLocaleString('en',{month:'short'}); });
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
      return {
        label: new Date(d2).toLocaleDateString('en',{month:'short',day:'numeric'}),
        count,
        isHighest: count === maxWk && i > 0,
        isPeak: count > (avgWk * 1.2) && count !== maxWk,
        note: i === 0 ? 'Most recent complete week' : ''
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
      dlTrendSub = monthDlArr.map(([m,v]) => m + ' ' + (v/1000).toFixed(0) + 'K').join(' → ');
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
      dlTotalFmt: (dlTotal/1000).toFixed(1) + 'K',
      revFmt: '$' + (revTotal/1000).toFixed(0) + 'K',
      dlTrend, dlTrendDir, dlTrendSub,
      period: firstSeens[0]?.slice(0,10) + ' – ' + dataEnd?.slice(0,10),
      revSub: 'US: ' + Math.round((countryRevMap['US']||0)/revTotal*100) + '% · MX: ' + Math.round((countryRevMap['MX']||0)/revTotal*100) + '%',
      revBreakdown: 'US $' + ((countryRevMap['US']||0)/1000).toFixed(1) + 'K · MX $' + ((countryRevMap['MX']||0)/1000).toFixed(1) + 'K',
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
    });

    // Also store the creatives for auto-label
    window.alCreatives = uc.map(r => ({
      id: (r['Creative URL']||'').split('/').pop() || r['Creative URL'] || Math.random().toString(36).slice(2),
      url: r['Creative URL'] || '',
      type: r['Type'] || 'video',
      dur: parseInt(r['Duration'])||0,
      stage: (parseInt(r['Duration'])||0) < 7 ? 'Launch' : (parseInt(r['Duration'])||0) < 21 ? 'Testing' : (parseInt(r['Duration'])||0) < 60 ? 'Scaling' : 'Decay',
      vidDur: parseFloat(r['Video Duration']) || null,
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

// ══════════════════════════════════════════════════════
// AUTO-LABEL ENGINE — Claude API built-in (no key needed)
// ══════════════════════════════════════════════════════

const AL_HOOK_OPTIONS    = ["Social proof","Gameplay demo","Win/Reward reveal","FOMO/Urgency","Challenge/Puzzle","Tutorial/How-to","Nostalgia/Lifestyle"];
const AL_EMOTION_OPTIONS = ["Excitement","Nostalgia","Competitiveness","Relaxation","Social connection","Curiosity","FOMO"];
const AL_MECHANIC_OPTIONS= ["Card flip reveal","Match/Win animation","Real gameplay footage","Tutorial walkthrough","Text-heavy/Static","Voice-over demo","UGC/Fake-UGC","Short-hook ≤10s"];

// Label store — survives tab switches within session
window.alLabels = window.alLabels || {};
window.alCreatives = window.alCreatives || null; // populated from CSV upload

// Default creative list from Conquian Sensor Tower data
const AL_DEFAULT_CREATIVES = [
  { id:"17afbccad8164b4b", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/17afbccad8164b4b/media", type:"video", dur:359, stage:"Decay",   vidDur:26.6 },
  { id:"a462798bcef85add", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/a462798bcef85add/media", type:"video", dur:359, stage:"Decay",   vidDur:27.2 },
  { id:"c33a175638db4a0a", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/c33a175638db4a0a/media", type:"video", dur:359, stage:"Decay",   vidDur:27.2 },
  { id:"c7e4c71ff2cc46f3", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/c7e4c71ff2cc46f3/media", type:"video", dur:359, stage:"Decay",   vidDur:26.4 },
  { id:"07c14c0178cda776", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/07c14c0178cda776/media", type:"video", dur:226, stage:"Decay",   vidDur:26.7 },
  { id:"3b655d4b8e7c4e50", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/3b655d4b8e7c4e50/media", type:"video", dur:226, stage:"Decay",   vidDur:26.7 },
  { id:"01b2ddc3d6f79b5d", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/01b2ddc3d6f79b5d/media", type:"video", dur:72,  stage:"Scaling", vidDur:13.1 },
  { id:"0d2bbe23015eb64b", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/0d2bbe23015eb64b/media", type:"video", dur:63,  stage:"Scaling", vidDur:25.7 },
  { id:"0ee189c3943ba291", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/0ee189c3943ba291/media", type:"video", dur:38,  stage:"Testing", vidDur:8.7  },
  { id:"0eab42cb611a90aa", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/0eab42cb611a90aa/media", type:"video", dur:7,   stage:"Launch",  vidDur:16.5 },
  { id:"0f1c5176fd16be9c", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/0f1c5176fd16be9c/media", type:"image", dur:132, stage:"Decay",   vidDur:null },
  { id:"3baef3b5b9d1aeb7", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/3baef3b5b9d1aeb7/media", type:"image", dur:139, stage:"Decay",   vidDur:null },
  { id:"5d0aa7945686970f", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/5d0aa7945686970f/media", type:"video", dur:54,  stage:"Scaling", vidDur:15.3 },
  { id:"601e13f01dee20ed", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/601e13f01dee20ed/media", type:"video", dur:52,  stage:"Scaling", vidDur:16.5 },
  { id:"5fbfbf51926ea264", url:"https://x-ad-assets.s3.amazonaws.com/media_asset/5fbfbf51926ea264/media", type:"video", dur:33,  stage:"Testing", vidDur:24.5 },
];

function getCreativeList() {
  return window.alCreatives || AL_DEFAULT_CREATIVES;
}

function filterByScope(creatives, scope) {
  if (scope === 'top10')   return creatives.slice(0, 10);
  if (scope === 'active')  return creatives.filter(c => c.dur <= 60 || c.stage !== 'Decay');
  if (scope === 'scaling') return creatives.filter(c => ['Scaling','Testing','Launch'].includes(c.stage));
  return creatives; // 'all'
}

// Build Claude prompt — metadata-based (works for all, no image fetch needed for video)
function buildMetadataPrompt(creative) {
  const durationDesc = creative.vidDur
    ? `Video duration: ${creative.vidDur.toFixed(1)}s (${creative.vidDur <= 10 ? 'very short/hook format' : creative.vidDur <= 20 ? 'short-form' : creative.vidDur <= 30 ? 'standard' : 'long-form'})`
    : `Image/static creative`;
  const stageDesc = `Campaign stage: ${creative.stage} (running ${creative.dur} days)`;
  const gameCtx = `Game: Conquian Zingplay — Mexican card game (similar to Rummy), casual/card genre, main markets MX & US`;

  return `You are a mobile UA creative analyst specializing in casual card games.

Analyze this ad creative based on its metadata:
- ${gameCtx}
- Creative type: ${creative.type}
- ${durationDesc}
- ${stageDesc}
- Creative ID: ${creative.id}

Based on the duration, type, and campaign stage patterns for a Mexican card game, classify this creative.

Return ONLY a JSON object, no other text:
{
  "hook": one of ${JSON.stringify(AL_HOOK_OPTIONS)},
  "emotion": one of ${JSON.stringify(AL_EMOTION_OPTIONS)},
  "mechanic": one of ${JSON.stringify(AL_MECHANIC_OPTIONS)},
  "confidence": number 0-100,
  "reasoning": "one sentence explaining the classification"
}

Guidance:
- 13s videos for card games are typically Win/Reward reveal or Gameplay demo
- 25-28s videos are usually Gameplay demo or Social proof
- Image creatives running 100+ days are likely Social proof or static brand
- Videos <10s are typically FOMO/Urgency or short hooks
- Decay stage (60+ days) creatives that survived = likely Social proof or Gameplay demo (proven format)`;
}

// Try CORS fetch for image, return null if fails
async function tryFetchImage(url) {
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image')) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ data: reader.result.split(',')[1], type: blob.type });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

// Label one creative via Claude API built-in
async function labelOneCreative(creative) {
  if (window.alLabels[creative.id]) return window.alLabels[creative.id]; // cache hit

  let messages;

  // For image creatives: try visual analysis first
  if (creative.type === 'image') {
    const imgData = await tryFetchImage(creative.url);
    if (imgData) {
      messages = [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: imgData.type, data: imgData.data } },
          { type: 'text', text: `You are a mobile UA creative analyst for casual card games (Conquian Zingplay — Mexican card game, markets MX/US).

Analyze this ad creative image. Return ONLY a JSON object:
{
  "hook": one of ${JSON.stringify(AL_HOOK_OPTIONS)},
  "emotion": one of ${JSON.stringify(AL_EMOTION_OPTIONS)},
  "mechanic": one of ${JSON.stringify(AL_MECHANIC_OPTIONS)},
  "confidence": number 0-100,
  "reasoning": "one sentence"
}` }
        ]
      }];
    }
  }

  // Fallback: metadata-based prompt (works for all video, and image if CORS fails)
  if (!messages) {
    messages = [{
      role: 'user',
      content: buildMetadataPrompt(creative)
    }];
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = (data.content?.[0]?.text || '').trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');

  const result = JSON.parse(match[0]);
  window.alLabels[creative.id] = result;
  return result;
}

// Update creative card in F1 grid with new tags
function applyTagsToCard(creativeId, labels) {
  document.querySelectorAll('.cc-title').forEach(el => {
    if (!el.textContent.includes(creativeId.slice(0, 12))) return;
    const meta = el.closest('.cc-meta');
    if (!meta) return;
    meta.querySelectorAll('.al-auto-tags').forEach(t => t.remove());
    const div = document.createElement('div');
    div.className = 'al-auto-tags';
    div.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;';
    if (labels.hook)     div.innerHTML += `<span class="ctag ctag-hook">${labels.hook}</span>`;
    if (labels.emotion)  div.innerHTML += `<span class="ctag ctag-emotion">${labels.emotion}</span>`;
    if (labels.mechanic) div.innerHTML += `<span class="ctag ctag-mechanic">${labels.mechanic}</span>`;
    meta.appendChild(div);
  });
}

// Main run function
async function runAutoLabel() {
  const scope   = document.getElementById('al-scope').value;
  const runBtn  = document.getElementById('al-run-btn');
  const inner   = document.getElementById('al-btn-inner');
  const progWrap= document.getElementById('al-progress-wrap');
  const progText= document.getElementById('al-progress-text');
  const progFill= document.getElementById('al-progress-fill');
  const results = document.getElementById('al-results-wrap');
  const countEl = document.getElementById('al-label-count');

  const creatives = filterByScope(getCreativeList(), scope);
  if (!creatives.length) { alert('Không có creative nào match scope này.'); return; }

  runBtn.disabled = true;
  inner.innerHTML = '<div class="al-spinner"></div> Analyzing…';
  progWrap.classList.add('visible');
  results.innerHTML = '';

  let done = 0, errors = 0;
  const total = creatives.length;

  for (const c of creatives) {
    progText.textContent = `(${done + 1}/${total}) Analyzing ${c.id.slice(0,10)}… [${c.type} · ${c.dur}d · ${c.stage}]`;
    progFill.style.width = (done / total * 100) + '%';

    try {
      const label = await labelOneCreative(c);
      applyTagsToCard(c.id, label);

      const row = document.createElement('div');
      row.className = 'al-row';
      row.innerHTML = `
        <div class="al-row-id">${c.id.slice(0,14)}<br><span style="color:var(--t3)">${c.type} · ${c.dur}d</span></div>
        <div class="al-row-tags">
          <span class="ctag ctag-hook">${label.hook || '—'}</span>
          <span class="ctag ctag-emotion">${label.emotion || '—'}</span>
          <span class="ctag ctag-mechanic">${label.mechanic || '—'}</span>
        </div>
        <div class="al-row-conf">${label.confidence || '—'}%</div>`;
      results.appendChild(row);
      results.scrollTop = results.scrollHeight;

    } catch (err) {
      errors++;
      const row = document.createElement('div');
      row.className = 'al-row';
      row.innerHTML = `
        <div class="al-row-id">${c.id.slice(0,14)}</div>
        <div class="al-row-err">Error: ${err.message.slice(0, 55)}</div>`;
      results.appendChild(row);
    }

    done++;
    await new Promise(r => setTimeout(r, 250)); // rate limit buffer
  }

  progFill.style.width = '100%';
  progText.textContent = `✓ Done — ${done - errors} labeled, ${errors} errors.`;

  const labeled = Object.keys(window.alLabels).length;
  countEl.textContent = `${labeled} creatives labeled`;
  countEl.style.display = 'inline';
  document.getElementById('al-export-btn').style.display = 'inline-flex';

  runBtn.disabled = false;
  inner.innerHTML = '<svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M5 3l8 5-8 5V3z" fill="currentColor"/></svg> Label more';
}

// Export all labels as CSV
function exportLabels() {
  const labels = window.alLabels;
  if (!Object.keys(labels).length) { alert('Chưa có labels — chạy auto-label trước.'); return; }
  const rows = ['creative_id,hook,emotion,mechanic,confidence,reasoning'];
  Object.entries(labels).forEach(([id, l]) => {
    rows.push([
      id,
      (l.hook||'').replace(/,/g,';'),
      (l.emotion||'').replace(/,/g,';'),
      (l.mechanic||'').replace(/,/g,';'),
      l.confidence || '',
      (l.reasoning||'').replace(/,/g,';')
    ].join(','));
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'creative-labels-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}

// Show/hide panel
function toggleAlPanel(show) {
  const p = document.getElementById('al-panel');
  if (p) p.style.display = show === false ? 'none' : 'block';
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
    topChannel: { name: 'Organic Search', pct: 43 },
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
        { name: 'Organic Search', values: [51200, 43500, 35800], total: 130500 },
        { name: 'Paid Display', values: [31700, 27200, 22400], total: 81300 },
        { name: 'Web Browser', values: [22100, 18600, 15200], total: 55900 },
        { name: 'Organic Browse', values: [10200, 8700, 7100], total: 26000 },
        { name: 'Paid Search', values: [3800, 3000, 2500], total: 9300 },
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
    topChannel: { name: 'Paid Display', pct: 38 },
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
        { name: 'Paid Display', values: [152000, 158000, 146000], total: 456000 },
        { name: 'Organic Search', values: [120000, 124000, 118000], total: 362000 },
        { name: 'Web Browser', values: [80000, 84000, 78000], total: 242000 },
        { name: 'Organic Browse', values: [40000, 42000, 38000], total: 120000 },
        { name: 'Paid Search', values: [8000, 7000, 5000], total: 20000 },
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
    topChannel: { name: 'Paid Display', pct: 45 },
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
        { name: 'Paid Display', values: [525000, 560000, 490000], total: 1575000 },
        { name: 'Organic Search', values: [280000, 295000, 260000], total: 835000 },
        { name: 'Web Browser', values: [210000, 220000, 195000], total: 625000 },
        { name: 'Organic Browse', values: [105000, 110000, 98000], total: 313000 },
        { name: 'Paid Search', values: [55000, 50000, 47000], total: 152000 },
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

// ── INIT: populate UI with default Conquian data on load ──
(function initDefaultData() {
  initCharts();
  initF2Chart();
  updateAllUI(compDataFull['Conquian Zingplay']);
})();
