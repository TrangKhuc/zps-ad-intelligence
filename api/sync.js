const { getSupabase } = require('./lib/supabase');
const { getSalesEstimates, getCreatives, getNetworkAnalysis } = require('./lib/sensor-tower');
const { ok, badRequest, serverError, logApiCall } = require('./lib/respond');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { app_id } = req.body || {};
  if (!app_id) {
    return badRequest(res, 'app_id is required');
  }

  const supabase = getSupabase();

  try {
    // 1. Get app from watchlist
    const { data: app, error: appErr } = await supabase
      .from('watchlist_apps')
      .select('*')
      .eq('id', app_id)
      .single();

    if (appErr || !app) {
      return badRequest(res, 'App not found in watchlist');
    }

    const stId = app.sensor_tower_id;
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    const startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];
    const start = Date.now();

    // 2. Fetch from Sensor Tower in parallel
    const [salesResult, creativesResult, networkResult] = await Promise.allSettled([
      getSalesEstimates(stId, { startDate, endDate }),
      getCreatives(stId, { startDate, endDate }),
      getNetworkAnalysis(stId, { startDate, endDate })
    ]);

    // Log API calls
    const endpoints = [
      '/v1/unified/sales_report_estimates',
      '/v1/unified/ad_intel/creatives',
      '/v1/unified/ad_intel/network_analysis'
    ];
    for (let i = 0; i < endpoints.length; i++) {
      const r = [salesResult, creativesResult, networkResult][i];
      await logApiCall(supabase, {
        endpoint: endpoints[i],
        status: r.status === 'fulfilled' ? 200 : (r.reason?.status || 500),
        responseMs: Date.now() - start,
        appId: app_id
      });
    }

    // 3. Process sales data
    let downloads = 0, revenueCents = 0, markets = [];
    if (salesResult.status === 'fulfilled') {
      const sales = salesResult.value;
      const entries = Array.isArray(sales) ? sales : (sales.results || sales.data || []);
      for (const entry of entries) {
        downloads += entry.units_downloaded || entry.downloads || 0;
        revenueCents += Math.round((entry.revenue || 0) * 100);
      }
      // Extract market breakdown if available
      if (entries.length > 0 && entries[0].country) {
        const byCountry = {};
        for (const e of entries) {
          const cc = e.country || 'XX';
          if (!byCountry[cc]) byCountry[cc] = { downloads: 0, revenue: 0 };
          byCountry[cc].downloads += e.units_downloaded || e.downloads || 0;
          byCountry[cc].revenue += Math.round((e.revenue || 0) * 100);
        }
        const totalDl = Object.values(byCountry).reduce((s, c) => s + c.downloads, 0) || 1;
        markets = Object.entries(byCountry).map(([cc, data]) => ({
          country_code: cc,
          downloads: data.downloads,
          revenue_cents: data.revenue,
          rpd_cents: data.downloads > 0 ? Math.round(data.revenue / data.downloads) : 0,
          share_pct: Math.round((data.downloads / totalDl) * 10000) / 100
        }));
      }
    }

    // 4. Process creatives
    let totalCreatives = 0, activeCreatives = 0, creativesToInsert = [];
    if (creativesResult.status === 'fulfilled') {
      const crData = creativesResult.value;
      const creatives = Array.isArray(crData) ? crData : (crData.creatives || crData.results || crData.data || []);
      totalCreatives = creatives.length;

      for (const cr of creatives) {
        const firstSeen = cr.first_seen_date || cr.first_seen;
        const lastSeen = cr.last_seen_date || cr.last_seen;
        const status = classifyCreativeStatus(firstSeen, lastSeen);
        if (status === 'active' || status === 'scaling') activeCreatives++;

        creativesToInsert.push({
          app_id,
          sensor_tower_creative_id: cr.creative_id || cr.id || `${stId}_${totalCreatives}`,
          format: cr.creative_type || cr.format || 'other',
          network: cr.ad_network || cr.network || 'unknown',
          platform: cr.os || cr.platform || app.platform,
          duration_seconds: cr.duration || null,
          first_seen: firstSeen || null,
          last_seen: lastSeen || null,
          status,
          thumbnail_url: cr.thumbnail_url || cr.preview_image || null,
          preview_url: cr.preview_url || cr.creative_url || null,
          title: cr.title || null
        });
      }
    }

    // 5. Process network data
    let networkImpressions = [], networksCount = 0, primaryNetwork = null;
    if (networkResult.status === 'fulfilled') {
      const netData = networkResult.value;
      const networks = Array.isArray(netData) ? netData : (netData.networks || netData.results || netData.data || []);

      const byNetwork = {};
      for (const n of networks) {
        const name = n.ad_network || n.network || 'unknown';
        if (!byNetwork[name]) byNetwork[name] = 0;
        byNetwork[name] += n.impressions || n.creative_count || 0;
      }

      networksCount = Object.keys(byNetwork).length;
      const sorted = Object.entries(byNetwork).sort((a, b) => b[1] - a[1]);
      primaryNetwork = sorted[0]?.[0] || null;

      // Monthly breakdown for network_impressions table
      for (const n of networks) {
        const month = n.date || n.month || endDate.substring(0, 7) + '-01';
        networkImpressions.push({
          app_id,
          network: n.ad_network || n.network || 'unknown',
          month: typeof month === 'string' ? month.substring(0, 10) : month,
          impressions: n.impressions || n.creative_count || 0
        });
      }
    }

    // 6. Calculate CHI / CREI
    const chi = calculateCHI({ activeCreatives, totalCreatives, creativesToInsert });
    const crei = calculateCREI({ creativesToInsert, networksCount });

    // 7. Write to Supabase
    // 7a. Snapshot
    const { data: snapshot, error: snapErr } = await supabase
      .from('app_snapshots')
      .insert({
        app_id,
        snapshot_date: endDate,
        downloads,
        revenue_cents: revenueCents,
        active_creatives: activeCreatives,
        total_creatives: totalCreatives,
        chi_score: chi,
        crei_score: crei,
        networks_count: networksCount,
        primary_network: primaryNetwork
      })
      .select()
      .single();

    if (snapErr) throw snapErr;

    // 7b. Markets
    if (markets.length > 0) {
      const marketsWithSnapshot = markets.map(m => ({ ...m, snapshot_id: snapshot.id }));
      await supabase.from('app_markets').insert(marketsWithSnapshot);
    }

    // 7c. Creatives (upsert by sensor_tower_creative_id)
    if (creativesToInsert.length > 0) {
      // Delete old creatives for this app, then insert fresh
      await supabase.from('creatives').delete().eq('app_id', app_id);
      // Insert in batches of 100
      for (let i = 0; i < creativesToInsert.length; i += 100) {
        const batch = creativesToInsert.slice(i, i + 100);
        await supabase.from('creatives').insert(batch);
      }
    }

    // 7d. Network impressions (upsert)
    if (networkImpressions.length > 0) {
      await supabase.from('network_impressions').delete().eq('app_id', app_id);
      await supabase.from('network_impressions').insert(networkImpressions);
    }

    // 7e. Update last_synced_at
    await supabase
      .from('watchlist_apps')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', app_id);

    return ok(res, {
      message: 'Sync complete',
      app_id,
      snapshot: {
        downloads,
        revenue_cents: revenueCents,
        active_creatives: activeCreatives,
        total_creatives: totalCreatives,
        chi_score: chi,
        crei_score: crei,
        networks_count: networksCount,
        primary_network: primaryNetwork
      },
      errors: {
        sales: salesResult.status === 'rejected' ? salesResult.reason?.message : null,
        creatives: creativesResult.status === 'rejected' ? creativesResult.reason?.message : null,
        network: networkResult.status === 'rejected' ? networkResult.reason?.message : null
      }
    });
  } catch (err) {
    return serverError(res, err);
  }
};

// --- Helper functions ---

function classifyCreativeStatus(firstSeen, lastSeen) {
  if (!firstSeen) return 'active';
  const now = new Date();
  const first = new Date(firstSeen);
  const last = lastSeen ? new Date(lastSeen) : now;
  const ageDays = (now - first) / (1000 * 60 * 60 * 24);
  const lastSeenDays = (now - last) / (1000 * 60 * 60 * 24);

  if (ageDays < 14) return 'testing';
  if (lastSeenDays > 30) return 'decay';
  if (ageDays < 60) return 'scaling';
  return ageDays > 60 ? 'decay' : 'active';
}

function calculateCHI({ activeCreatives, totalCreatives, creativesToInsert }) {
  if (totalCreatives === 0) return 0;

  const activeRate = activeCreatives / totalCreatives;

  // Hook diversity: count unique hooks from tags (simplified — count unique networks as proxy)
  const uniqueNetworks = new Set(creativesToInsert.map(c => c.network)).size;
  const hookDiversity = Math.min(uniqueNetworks / 5, 1);

  // Outperform rate: creatives running > median duration
  const durations = creativesToInsert
    .filter(c => c.first_seen)
    .map(c => (Date.now() - new Date(c.first_seen).getTime()) / (1000 * 60 * 60 * 24));
  const median = durations.length > 0 ? durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)] : 30;
  const outperformRate = durations.length > 0
    ? durations.filter(d => d > median).length / durations.length
    : 0.5;

  // Refresh cadence: new creatives in last 14 days / total
  const recent = creativesToInsert.filter(c => {
    if (!c.first_seen) return false;
    return (Date.now() - new Date(c.first_seen).getTime()) / (1000 * 60 * 60 * 24) < 14;
  }).length;
  const refreshCadence = Math.min((recent / 2) / 10, 1); // normalized: 10 new/week = 1.0

  const chi = (activeRate * 0.30 + hookDiversity * 0.25 + outperformRate * 0.25 + refreshCadence * 0.20) * 100;
  return Math.round(chi * 100) / 100;
}

function calculateCREI({ creativesToInsert, networksCount }) {
  if (creativesToInsert.length === 0) return 0;

  // Momentum: recent (14d) / total
  const recent = creativesToInsert.filter(c => {
    if (!c.first_seen) return false;
    return (Date.now() - new Date(c.first_seen).getTime()) / (1000 * 60 * 60 * 24) < 14;
  }).length;
  const momentum = Math.min(recent / Math.max(creativesToInsert.length * 0.1, 1), 1);

  // Engagement delta: simplified — active rate change proxy
  const activeCount = creativesToInsert.filter(c => c.status === 'active' || c.status === 'scaling').length;
  const engagementDelta = activeCount / Math.max(creativesToInsert.length, 1);

  // Channel stability: 1 - HHI
  const networkCounts = {};
  for (const c of creativesToInsert) {
    networkCounts[c.network] = (networkCounts[c.network] || 0) + 1;
  }
  const total = creativesToInsert.length;
  const hhi = Object.values(networkCounts).reduce((sum, count) => {
    const share = count / total;
    return sum + share * share;
  }, 0);
  const channelStability = 1 - hhi;

  const crei = (momentum * 0.40 + engagementDelta * 0.35 + channelStability * 0.25) * 100;
  return Math.round(crei * 100) / 100;
}
