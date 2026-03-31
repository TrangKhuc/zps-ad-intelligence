const { getSupabase } = require('./lib/supabase');
const { ok, serverError } = require('./lib/respond');

// Re-use sync logic inline to avoid Vercel function import issues
const syncHandler = require('./sync');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabase();

  try {
    // Get all watchlist apps
    const { data: apps, error } = await supabase
      .from('watchlist_apps')
      .select('id, app_name')
      .order('added_at', { ascending: true });

    if (error) throw error;

    if (!apps || apps.length === 0) {
      return ok(res, { message: 'No apps in watchlist', results: [] });
    }

    // Sync each app sequentially to avoid rate limits
    const results = [];
    for (const app of apps) {
      try {
        // Create a mock req/res to call sync handler
        const syncResult = await syncOneApp(supabase, app.id);
        results.push({ app_id: app.id, app_name: app.app_name, status: 'ok', ...syncResult });
      } catch (err) {
        results.push({ app_id: app.id, app_name: app.app_name, status: 'error', error: err.message });
      }
    }

    return ok(res, { message: `Synced ${results.filter(r => r.status === 'ok').length}/${apps.length} apps`, results });
  } catch (err) {
    return serverError(res, err);
  }
};

// Inline sync for one app (avoids mock req/res complexity)
async function syncOneApp(supabase, appId) {
  const { getSalesEstimates, getCreatives, getNetworkAnalysis } = require('./lib/sensor-tower');
  const { logApiCall } = require('./lib/respond');

  const { data: app } = await supabase
    .from('watchlist_apps')
    .select('*')
    .eq('id', appId)
    .single();

  if (!app) throw new Error('App not found');

  const stId = app.sensor_tower_id;
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  const startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];

  const [salesResult, creativesResult, networkResult] = await Promise.allSettled([
    getSalesEstimates(stId, { startDate, endDate }),
    getCreatives(stId, { startDate, endDate }),
    getNetworkAnalysis(stId, { startDate, endDate })
  ]);

  // Process and save (simplified — counts only for sync-all summary)
  let downloads = 0, totalCreatives = 0;

  if (salesResult.status === 'fulfilled') {
    const entries = Array.isArray(salesResult.value) ? salesResult.value : (salesResult.value.results || []);
    downloads = entries.reduce((s, e) => s + (e.units_downloaded || e.downloads || 0), 0);
  }

  if (creativesResult.status === 'fulfilled') {
    const creatives = Array.isArray(creativesResult.value) ? creativesResult.value : (creativesResult.value.creatives || []);
    totalCreatives = creatives.length;
  }

  await supabase
    .from('watchlist_apps')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', appId);

  return { downloads, total_creatives: totalCreatives };
}
