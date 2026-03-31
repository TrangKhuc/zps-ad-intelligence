const { getSupabase } = require('./lib/supabase');
const { ok, badRequest, serverError } = require('./lib/respond');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    app_id,
    page = '1',
    limit = '12',
    network,
    platform,
    format,
    tag,
    quality,
    sort = 'first_seen',
    order = 'desc',
    date_range
  } = req.query;

  if (!app_id) {
    return badRequest(res, 'app_id query parameter is required');
  }

  const supabase = getSupabase();
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  try {
    // Build query
    let query = supabase
      .from('creatives')
      .select('*, creative_tags(*)', { count: 'exact' })
      .eq('app_id', app_id);

    // Filters
    if (network) query = query.eq('network', network);
    if (platform) query = query.eq('platform', platform);
    if (format) query = query.eq('format', format);
    if (quality) {
      // Quality filter based on status mapping
      if (quality === 'top') query = query.in('status', ['active', 'scaling']);
      else if (quality === 'low') query = query.eq('status', 'decay');
    }

    // Date range filter
    if (date_range) {
      const now = new Date();
      let since;
      if (date_range === '1') since = new Date(now - 1 * 24 * 60 * 60 * 1000);       // Today
      else if (date_range === '7') since = new Date(now - 7 * 24 * 60 * 60 * 1000);   // 7d
      else if (date_range === '30') since = new Date(now - 30 * 24 * 60 * 60 * 1000);  // 30d
      else if (date_range === '90') since = new Date(now - 90 * 24 * 60 * 60 * 1000);  // 90d
      if (since) query = query.gte('first_seen', since.toISOString().split('T')[0]);
    }

    // Sort
    const sortCol = ['first_seen', 'last_seen', 'duration_seconds', 'network', 'created_at'].includes(sort)
      ? sort : 'first_seen';
    query = query.order(sortCol, { ascending: order === 'asc' });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: creatives, error, count } = await query;

    if (error) throw error;

    // If tag filter requested, filter client-side (PostgREST nested filter is limited)
    let filtered = creatives;
    if (tag) {
      filtered = creatives.filter(c =>
        c.creative_tags?.some(t => t.tag_value === tag || t.tag_type === tag)
      );
    }

    return ok(res, {
      creatives: filtered,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (err) {
    return serverError(res, err);
  }
};
