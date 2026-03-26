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
  scale:    'rgba(91,80,232,0.75)',
  decay:    'rgba(224,64,64,0.75)',
  social:   'rgba(13,158,114,0.75)',
  fomo:     'rgba(91,80,232,0.75)',
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
      backgroundColor: '#1a1a2e',
      titleFont: { family: 'DM Mono', size: 10 },
      bodyFont:  { family: 'DM Sans', size: 11 },
      padding: 10, cornerRadius: 6,
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#bbbbd0' } },
    y: { grid: { color: '#f0f0f5', drawBorder: false }, ticks: { font: { family: 'DM Mono', size: 9 }, color: '#bbbbd0' }, beginAtZero: true }
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
      { label: 'New creatives', data: [17,18,12,34,20,19,25,16,20,19,24,18], backgroundColor: 'rgba(91,80,232,0.65)', borderRadius: 3, yAxisID: 'y', order: 2 },
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
  container.innerHTML = PILLS[type]
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

    // ── UPDATE UI ──
    document.getElementById('v-chi').textContent = chi;
    document.getElementById('s-chi').innerHTML = 'Active rate ' + Math.round(activeRate) + '% · CHI real data';
    document.getElementById('v-crei').textContent = crei;
    document.getElementById('s-crei').innerHTML = 'WoW ' + (wow>=0?'+':'') + Math.round(wow) + '% · CREI real data';
    document.getElementById('v-imp').textContent = (dlTotal/1000).toFixed(1) + 'K';
    document.getElementById('sync-label').textContent = 'Real data · ' + appName;
    document.getElementById('data-badge').textContent = 'Uploaded';
    document.getElementById('data-badge').classList.remove('demo');

    // Update topbar
    document.getElementById('active-comp-name').textContent = appName;

    // Rebuild stage chart with new data
    if (chartInstances['c-stage']) {
      chartInstances['c-stage'].data.datasets[0].data = [stages.Launch, stages.Testing, stages.Scaling, stages.Decay];
      chartInstances['c-stage'].update();
    }

    // Rebuild format chart
    if (chartInstances['c-format']) {
      const vbVals = [vbuckets['21-30s']||0, vbuckets['11-20s']||0,
        uc.filter(r=>r['Type']==='image').length, vbuckets['>30s']||0, vbuckets['≤10s']||0];
      chartInstances['c-format'].data.datasets[0].data = vbVals;
      chartInstances['c-format'].update();
    }

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
          backgroundColor: labels.map((_, i) => i < 5 ? 'rgba(91,80,232,0.65)' : 'rgba(91,80,232,0.4)'),
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
          pointBackgroundColor: labels.map((_, i) => i < 5 ? 'rgba(91,80,232,1)' : 'rgba(224,64,64,1)'),
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
        legend: { display: true, position: 'bottom', labels: { font: { family: 'DM Mono', size: 9 }, color: '#8888aa', boxWidth: 10, padding: 14 } },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: 'DM Mono', size: 10 },
          bodyFont:  { family: 'DM Sans', size: 11 },
          padding: 10, cornerRadius: 6,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'DM Mono', size: 8 }, color: '#bbbbd0' }
        },
        y: {
          position: 'left',
          grid: { color: '#f0f0f5' },
          title: { display: true, text: 'New creatives', font: { family: 'DM Mono', size: 8 }, color: '#bbbbd0' },
          ticks: { stepSize: 5, font: { family: 'DM Mono', size: 8 }, color: '#bbbbd0' },
        },
        y2: {
          position: 'right',
          grid: { display: false },
          title: { display: true, text: 'Downloads (K)', font: { family: 'DM Mono', size: 8 }, color: '#bbbbd0' },
          ticks: { font: { family: 'DM Mono', size: 8 }, color: '#bbbbd0' },
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
const compDataReal = {
  'Conquian Zingplay': { chi:'67.5', cs:'warn', chi_s:'At risk · active rate 43%', crei:'72.2', cs2:'up', crei_s:'High momentum · DL declining', imp:'283.6K', dl:'↓ 15%', dc:'down', rev:'$109K', rc:'neutral', rank:'388 creatives', sent:'1' },
  'ZingPlay Poker':    { chi:'—', cs:'neutral', chi_s:'No data uploaded', crei:'—', cs2:'neutral', crei_s:'Upload ST export to analyze', imp:'—', dl:'—', dc:'neutral', rev:'—', rc:'neutral', rank:'—', sent:'—' },
  'ZPS Bài Cào':       { chi:'—', cs:'neutral', chi_s:'No data uploaded', crei:'—', cs2:'neutral', crei_s:'Upload ST export to analyze', imp:'—', dl:'—', dc:'neutral', rev:'—', rc:'neutral', rank:'—', sent:'—' },
};

function selectComp(btn, name) {
  document.querySelectorAll('.comp-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('active-comp-name').textContent = name;
  const d = compDataReal[name]; if (!d) return;
  const chiEl = document.getElementById('v-chi');
  chiEl.className = 'kpi-val ' + d.cs; chiEl.textContent = d.chi;
  document.getElementById('s-chi').textContent = d.chi_s;
  const creiEl = document.getElementById('v-crei');
  creiEl.className = 'kpi-val ' + d.cs2; creiEl.textContent = d.crei;
  document.getElementById('s-crei').textContent = d.crei_s;
  set('v-imp', d.imp); set('v-dl', d.dl, d.dc); set('v-rev', d.rev, d.rc);
  set('v-rank', d.rank, 'neutral'); set('v-sent', d.sent, 'neutral');
}
