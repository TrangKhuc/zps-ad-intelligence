const { getSupabase } = require('./lib/supabase');
const { ok, created, badRequest, serverError } = require('./lib/respond');

module.exports = async function handler(req, res) {
  const supabase = getSupabase();

  // GET — list all watchlist apps with latest snapshot
  if (req.method === 'GET') {
    try {
      const { data: apps, error } = await supabase
        .from('watchlist_apps')
        .select('*')
        .order('added_at', { ascending: true });

      if (error) throw error;

      // Fetch latest snapshot for each app
      const appsWithSnapshots = await Promise.all(
        apps.map(async (app) => {
          const { data: snapshots } = await supabase
            .from('app_snapshots')
            .select('*')
            .eq('app_id', app.id)
            .order('snapshot_date', { ascending: false })
            .limit(1);

          return {
            ...app,
            latest_snapshot: snapshots?.[0] || null
          };
        })
      );

      return ok(res, { apps: appsWithSnapshots });
    } catch (err) {
      return serverError(res, err);
    }
  }

  // POST — add app to watchlist
  if (req.method === 'POST') {
    const { sensor_tower_id, app_name, publisher, platform, icon_url, color } = req.body || {};

    if (!sensor_tower_id || !app_name) {
      return badRequest(res, 'sensor_tower_id and app_name are required');
    }

    try {
      // Check if already in watchlist
      const { data: existing } = await supabase
        .from('watchlist_apps')
        .select('id')
        .eq('sensor_tower_id', sensor_tower_id)
        .limit(1);

      if (existing && existing.length > 0) {
        return ok(res, { app: existing[0], message: 'App already in watchlist' });
      }

      const { data: app, error } = await supabase
        .from('watchlist_apps')
        .insert({
          sensor_tower_id,
          app_name,
          publisher: publisher || null,
          platform: platform || 'unified',
          icon_url: icon_url || null,
          color: color || '#4d65ff'
        })
        .select()
        .single();

      if (error) throw error;

      return created(res, { app });
    } catch (err) {
      return serverError(res, err);
    }
  }

  // DELETE — remove app from watchlist (cascade deletes snapshots, creatives, etc.)
  if (req.method === 'DELETE') {
    const { app_id } = req.body || {};

    if (!app_id) {
      return badRequest(res, 'app_id is required');
    }

    try {
      const { error } = await supabase
        .from('watchlist_apps')
        .delete()
        .eq('id', app_id);

      if (error) throw error;

      return ok(res, { message: 'App removed from watchlist' });
    } catch (err) {
      return serverError(res, err);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
