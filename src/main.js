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
  document.querySelectorAll('.fdrop-wrap.open').forEach(w => w.classList.remove('open'));
  if (!isOpen) wrap.classList.add('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.fdrop-wrap')) {
    document.querySelectorAll('.fdrop-wrap.open').forEach(w => w.classList.remove('open'));
  }
});
function filterUpdate() {
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
  if (f2ChartInited) return;
  const el = document.getElementById('c-f2-dl');
  if (!el) return;
  f2ChartInited = true;
  const labels = ['W1 Jan','W2 Jan','W3 Jan','W4 Jan','W1 Feb','W2 Feb','W3 Feb','W4 Feb','W1 Mar','W2 Mar','W3 Mar'];
  new Chart(el.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'New creatives', data: [17,18,12,34,20,19,25,16,20,19,24],
          backgroundColor: labels.map((_,i)=>i<5?'rgba(91,80,232,0.65)':'rgba(91,80,232,0.4)'),
          borderRadius: 3, yAxisID: 'y', order: 2 },
        { label: 'Downloads (K)', data: [28.6,24.0,26.4,31.3,30.4,22.5,24.4,21.7,19.8,19.7,18.8],
          type:'line', borderColor:'rgba(224,64,64,0.9)', backgroundColor:'transparent',
          tension:0.35, pointRadius:3,
          pointBackgroundColor: labels.map((_,i)=>i<5?'rgba(91,80,232,1)':'rgba(224,64,64,1)'),
          borderWidth:2, yAxisID:'y2', order:1 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: {
        legend:{ display:true, position:'bottom', labels:{font:{family:'DM Mono',size:9},color:'#8888aa',boxWidth:10,padding:14} },
        tooltip:{ backgroundColor:'#1a1a2e', titleFont:{family:'DM Mono',size:10}, bodyFont:{family:'DM Sans',size:11}, padding:10, cornerRadius:6 }
      },
      scales: {
        x:{ grid:{display:false}, ticks:{font:{family:'DM Mono',size:8},color:'#bbbbd0'} },
        y:{ position:'left', grid:{color:'#f0f0f5'},
            title:{display:true,text:'New creatives',font:{family:'DM Mono',size:8},color:'#bbbbd0'},
            ticks:{stepSize:5,font:{family:'DM Mono',size:8},color:'#bbbbd0'} },
        y2:{ position:'right', grid:{display:false},
             title:{display:true,text:'Downloads (K)',font:{family:'DM Mono',size:8},color:'#bbbbd0'},
             ticks:{font:{family:'DM Mono',size:8},color:'#bbbbd0'} }
      }
    }
  });
}

// ── SELECTCOMP update for demo vs real ──
const compDataReal = {
  'Conquian Zingplay': { chi:'67.5', cs:'warn', chi_s:'At risk · active rate 43%', crei:'72.2', cs2:'up', crei_s:'High momentum · DL declining', imp:'283.6K', dl:'↓ 15%', dc:'down', rev:'$109K', rc:'neutral', rank:'388 creatives', sent:'1' },
  'Zynga Poker':       { chi:'—', cs:'neutral', chi_s:'No data uploaded', crei:'—', cs2:'neutral', crei_s:'Upload ST export to analyze', imp:'—', dl:'—', dc:'neutral', rev:'—', rc:'neutral', rank:'—', sent:'—' },
  'Coin Master':       { chi:'—', cs:'neutral', chi_s:'No data uploaded', crei:'—', cs2:'neutral', crei_s:'Upload ST export to analyze', imp:'—', dl:'—', dc:'neutral', rev:'—', rc:'neutral', rank:'—', sent:'—' },
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
