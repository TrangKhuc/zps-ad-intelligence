const BASE_URL = 'https://api.sensortower.com';

function getToken() {
  const token = process.env.SENSOR_TOWER_TOKEN;
  if (!token) throw new Error('Missing SENSOR_TOWER_TOKEN env var');
  return token;
}

async function stFetch(endpoint, params = {}) {
  const token = getToken();
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('auth_token', token);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());

  if (res.status === 429) {
    throw { status: 429, message: 'Sensor Tower rate limit exceeded. Try again later.' };
  }
  if (!res.ok) {
    const body = await res.text();
    throw { status: res.status, message: `Sensor Tower API error: ${res.status}`, detail: body };
  }

  return res.json();
}

// Search apps by name
async function searchApps(query, limit = 10) {
  return stFetch('/v1/unified/search_entities', {
    search_term: query,
    limit: String(limit),
    entity_type: 'app'
  });
}

// Get download & revenue estimates
async function getSalesEstimates(appId, { startDate, endDate, countries, granularity = 'monthly' } = {}) {
  return stFetch('/v1/unified/sales_report_estimates', {
    app_ids: appId,
    start_date: startDate,
    end_date: endDate,
    countries: countries,
    granularity
  });
}

// Get ad creatives
async function getCreatives(appId, { startDate, endDate, networks, pageSize = 50, page = 0 } = {}) {
  return stFetch('/v1/unified/ad_intel/creatives', {
    app_ids: appId,
    start_date: startDate,
    end_date: endDate,
    ad_networks: networks,
    page_size: String(pageSize),
    page: String(page)
  });
}

// Get network/channel analysis
async function getNetworkAnalysis(appId, { startDate, endDate, granularity = 'monthly' } = {}) {
  return stFetch('/v1/unified/ad_intel/network_analysis', {
    app_ids: appId,
    start_date: startDate,
    end_date: endDate,
    granularity
  });
}

module.exports = { searchApps, getSalesEstimates, getCreatives, getNetworkAnalysis };
