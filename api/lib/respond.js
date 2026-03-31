// Standardized API response helpers

function ok(res, data) {
  return res.status(200).json(data);
}

function created(res, data) {
  return res.status(201).json(data);
}

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function serverError(res, err) {
  console.error('[API Error]', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  return res.status(status).json({ error: message });
}

// Log API call to Supabase (fire-and-forget)
async function logApiCall(supabase, { endpoint, status, responseMs, appId }) {
  try {
    await supabase.from('api_usage').insert({
      endpoint,
      response_status: status,
      response_ms: responseMs,
      app_id: appId || null
    });
  } catch (e) {
    console.error('[API Usage Log Error]', e);
  }
}

module.exports = { ok, created, badRequest, serverError, logApiCall };
