// Build 16: Pattern Detection Engine
// GET /api/patterns?app_id=...
// Analyzes app data and returns detected patterns + action items

const { getSupabase } = require('./lib/supabase');
const { ok, badRequest, serverError } = require('./lib/respond');

// Pattern detection rules
function detectPatterns(snapshot, creatives, markets, networks) {
  const patterns = [];
  const actions = [];

  if (!snapshot) return { patterns, actions };

  const totalCreatives = snapshot.total_creatives || 0;
  const activeCreatives = snapshot.active_creatives || 0;
  const chi = snapshot.chi_score || 0;
  const crei = snapshot.crei_score || 0;

  // 1. Creative fatigue: high decay rate
  if (creatives && creatives.length > 0) {
    const decayCount = creatives.filter(c => c.status === 'decay').length;
    const decayRate = totalCreatives > 0 ? decayCount / totalCreatives : 0;
    if (decayRate > 0.3) {
      patterns.push({
        name: 'Creative fatigue detected',
        severity: decayRate > 0.5 ? 'high' : 'medium',
        description: `${decayCount}/${totalCreatives} creatives (${Math.round(decayRate * 100)}%) in decay stage. Frequency fatigue risk is elevated.`,
        metrics: { decay_count: decayCount, decay_rate: Math.round(decayRate * 100) },
      });
      actions.push({
        tier: 'this_week',
        priority: 'high',
        title: `Audit ${decayCount} decaying creatives — pause those >120 days`,
        description: `${Math.round(decayRate * 100)}% of creatives in decay. Review and rotate.`,
      });
    }

    // Ultra-long runners
    const ultraLong = creatives.filter(c => {
      const days = c.first_seen && c.last_seen
        ? Math.round((new Date(c.last_seen) - new Date(c.first_seen)) / 86400000)
        : 0;
      return days > 180;
    });
    if (ultraLong.length > 0) {
      patterns.push({
        name: `${ultraLong.length} ultra-long creatives (>180 days)`,
        severity: 'high',
        description: `These creatives have been running for over 6 months. Severe fatigue risk.`,
        metrics: { count: ultraLong.length },
      });
    }
  }

  // 2. Network dependency: HHI check
  if (networks && networks.length > 0) {
    const totalImp = networks.reduce((s, n) => s + (n.impressions || 0), 0);
    if (totalImp > 0) {
      const shares = networks.map(n => (n.impressions || 0) / totalImp);
      const hhi = shares.reduce((s, v) => s + v * v, 0);
      if (hhi > 0.6) {
        const topNetwork = networks.sort((a, b) => (b.impressions || 0) - (a.impressions || 0))[0];
        patterns.push({
          name: 'Network concentration risk',
          severity: hhi > 0.8 ? 'high' : 'medium',
          description: `HHI ${hhi.toFixed(2)} — ${topNetwork?.network || 'Unknown'} dominates. Diversify to reduce risk.`,
          metrics: { hhi: hhi.toFixed(2), top_network: topNetwork?.network },
        });
        actions.push({
          tier: 'next_2_weeks',
          priority: 'medium',
          title: `Test ads on alternative networks (TikTok, Google UAC)`,
          description: `Current HHI ${hhi.toFixed(2)} indicates high concentration. Target 20% non-primary network spend.`,
        });
      }
    }
  }

  // 3. Market gap: RPD ratio
  if (markets && markets.length >= 2) {
    const sorted = [...markets].sort((a, b) => (b.rpd || 0) - (a.rpd || 0));
    const topRPD = sorted[0]?.rpd || 0;
    const bottomRPD = sorted[sorted.length - 1]?.rpd || 0;
    if (bottomRPD > 0 && topRPD / bottomRPD > 5) {
      patterns.push({
        name: 'Market RPD gap',
        severity: 'medium',
        description: `${sorted[0]?.country_code} RPD $${topRPD.toFixed(2)} vs ${sorted[sorted.length - 1]?.country_code} RPD $${bottomRPD.toFixed(2)} — ${Math.round(topRPD / bottomRPD)}× gap.`,
        metrics: { ratio: Math.round(topRPD / bottomRPD) },
      });
      actions.push({
        tier: 'next_2_weeks',
        priority: 'medium',
        title: `Create market-specific creatives for ${sorted[0]?.country_code}`,
        description: `RPD gap of ${Math.round(topRPD / bottomRPD)}× justifies separate creative strategy.`,
      });
    }
  }

  // 4. Low CHI
  if (chi < 50) {
    patterns.push({
      name: 'Low creative health (CHI < 50)',
      severity: 'high',
      description: `CHI score ${chi} — below healthy threshold. Creative pipeline needs attention.`,
      metrics: { chi },
    });
    actions.push({
      tier: 'this_week',
      priority: 'high',
      title: 'Review creative pipeline — CHI critically low',
      description: `CHI ${chi}. Focus on improving active rate and refresh cadence.`,
    });
  }

  // 5. High momentum (CREI)
  if (crei > 80) {
    patterns.push({
      name: 'High creative momentum',
      severity: 'info',
      description: `CREI ${crei} — strong momentum. Maintain current cadence.`,
      metrics: { crei },
    });
  }

  // Monitor actions
  actions.push({
    tier: 'monitor',
    priority: 'low',
    title: 'Track weekly download trend',
    description: `Current downloads: ${snapshot.downloads ? (snapshot.downloads / 1000).toFixed(1) + 'K' : '—'}`,
  });
  actions.push({
    tier: 'monitor',
    priority: 'low',
    title: 'Monitor creative refresh rate',
    description: `CHI ${chi} · ${activeCreatives}/${totalCreatives} active`,
  });

  return { patterns, actions };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return badRequest(res, 'GET only');

  try {
    const { app_id } = req.query || {};
    if (!app_id) return badRequest(res, 'app_id required');

    const supabase = getSupabase();

    // Fetch latest data
    const [snapshotRes, creativesRes, marketsRes, networksRes] = await Promise.all([
      supabase.from('latest_snapshots').select('*').eq('app_id', app_id).single(),
      supabase.from('creatives').select('*').eq('app_id', app_id),
      supabase.from('app_markets').select('*').eq('snapshot_id', app_id).limit(20),
      supabase.from('network_impressions').select('*').eq('app_id', app_id),
    ]);

    const snapshot = snapshotRes.data;
    const creatives = creativesRes.data || [];
    const markets = marketsRes.data || [];
    const networkData = networksRes.data || [];

    const { patterns, actions } = detectPatterns(snapshot, creatives, markets, networkData);

    return ok(res, { patterns, actions });
  } catch (err) {
    console.error('Pattern detection error:', err);
    return serverError(res, err.message);
  }
};
