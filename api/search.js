const { searchApps } = require('./lib/sensor-tower');
const { getSupabase } = require('./lib/supabase');
const { ok, badRequest, serverError, logApiCall } = require('./lib/respond');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query.q;
  if (!query || query.trim().length < 2) {
    return badRequest(res, 'Query parameter "q" is required (min 2 characters)');
  }

  const start = Date.now();
  try {
    const results = await searchApps(query.trim(), 10);

    // Normalize response — Sensor Tower returns varied formats
    const apps = Array.isArray(results) ? results : (results.results || results.data || []);
    const normalized = apps.map(app => ({
      sensor_tower_id: app.entity_id || app.app_id || app.id,
      app_name: app.name || app.app_name,
      publisher: app.publisher_name || app.publisher || app.developer,
      platform: app.os || app.platform || 'unified',
      icon_url: app.icon_url || app.icon || null
    }));

    await logApiCall(getSupabase(), {
      endpoint: '/v1/unified/search_entities',
      status: 200,
      responseMs: Date.now() - start
    });

    return ok(res, { results: normalized });
  } catch (err) {
    await logApiCall(getSupabase(), {
      endpoint: '/v1/unified/search_entities',
      status: err.status || 500,
      responseMs: Date.now() - start
    });
    return serverError(res, err);
  }
};
