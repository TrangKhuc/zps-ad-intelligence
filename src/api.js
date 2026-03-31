// ZPS Ad Intelligence — Frontend API Client
// All calls to /api/* serverless functions go through here

const API_BASE = '/api';

// ============================================================
// Search
// ============================================================
let _searchTimeout = null;

async function searchApps(query) {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

function searchAppsDebounced(query, callback, delay = 300) {
  clearTimeout(_searchTimeout);
  _searchTimeout = setTimeout(async () => {
    try {
      const results = await searchApps(query);
      callback(results, null);
    } catch (err) {
      callback([], err);
    }
  }, delay);
}

// ============================================================
// Watchlist
// ============================================================
async function getWatchlist() {
  const res = await fetch(`${API_BASE}/watchlist`);
  if (!res.ok) throw new Error(`Failed to load watchlist: ${res.status}`);
  const data = await res.json();
  return data.apps || [];
}

async function addToWatchlist(app) {
  const res = await fetch(`${API_BASE}/watchlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(app)
  });
  if (!res.ok) throw new Error(`Failed to add app: ${res.status}`);
  return (await res.json()).app;
}

async function removeFromWatchlist(appId) {
  const res = await fetch(`${API_BASE}/watchlist`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId })
  });
  if (!res.ok) throw new Error(`Failed to remove app: ${res.status}`);
  return true;
}

// ============================================================
// Sync
// ============================================================
async function syncApp(appId) {
  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId })
  });
  if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
  return res.json();
}

async function syncAllApps() {
  const res = await fetch(`${API_BASE}/sync-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Sync-all failed: ${res.status}`);
  return res.json();
}

// ============================================================
// Creatives
// ============================================================
async function getCreatives(appId, opts = {}) {
  const params = new URLSearchParams({ app_id: appId });
  if (opts.page) params.set('page', opts.page);
  if (opts.limit) params.set('limit', opts.limit);
  if (opts.network) params.set('network', opts.network);
  if (opts.platform) params.set('platform', opts.platform);
  if (opts.format) params.set('format', opts.format);
  if (opts.tag) params.set('tag', opts.tag);
  if (opts.quality) params.set('quality', opts.quality);
  if (opts.sort) params.set('sort', opts.sort);
  if (opts.order) params.set('order', opts.order);
  if (opts.date_range) params.set('date_range', opts.date_range);

  const res = await fetch(`${API_BASE}/creatives?${params}`);
  if (!res.ok) throw new Error(`Failed to load creatives: ${res.status}`);
  return res.json();
}

// ============================================================
// AI Tagging (Build 15)
// ============================================================
async function aiTag(appId) {
  const res = await fetch(`${API_BASE}/ai-tag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId })
  });
  if (!res.ok) throw new Error(`AI tag failed: ${res.status}`);
  return res.json();
}

// ============================================================
// Pattern Detection (Build 16)
// ============================================================
async function getPatterns(appId) {
  const res = await fetch(`${API_BASE}/patterns?app_id=${encodeURIComponent(appId)}`);
  if (!res.ok) throw new Error(`Patterns failed: ${res.status}`);
  return res.json();
}

// ============================================================
// Export Report (Build 14)
// ============================================================
async function getExportReport(appId) {
  const res = await fetch(`${API_BASE}/export?app_id=${encodeURIComponent(appId)}`);
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.json();
}

// ============================================================
// AI Vision Tagging (Gemini)
// ============================================================
async function aiTagVision(appId, opts = {}) {
  const res = await fetch(`${API_BASE}/ai-tag-vision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, limit: opts.limit || 20 })
  });
  if (!res.ok) throw new Error(`AI vision tag failed: ${res.status}`);
  return res.json();
}

// ============================================================
// Export to window for use in main.js (no module bundler)
// ============================================================
window.api = {
  searchApps,
  searchAppsDebounced,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  syncApp,
  syncAllApps,
  getCreatives,
  aiTag,
  aiTagVision,
  getPatterns,
  getExportReport,
};
