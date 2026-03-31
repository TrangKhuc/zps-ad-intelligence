// AI Auto-Tag with Gemini Vision API
// POST /api/ai-tag-vision { app_id, creative_ids? }
// Reads creative thumbnails from Sensor Tower and classifies via Gemini

const { getSupabase } = require('./lib/supabase');
const { ok, badRequest, serverError, logApiCall } = require('./lib/respond');

const GEMINI_MODEL = 'gemini-2.0-flash';

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Missing GEMINI_API_KEY env var');
  return key;
}

// Fetch image as base64
async function fetchImageBase64(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return { base64, contentType };
  } catch {
    return null;
  }
}

// Call Gemini Vision to classify a creative thumbnail
async function classifyWithGemini(apiKey, imageData, creativeMetadata) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const prompt = `You are an ad creative analyst for mobile games. Analyze this ad creative thumbnail and classify the HOOK type used.

Return a JSON object with this single field:

- hook: one of ["Gameplay demo", "Social proof", "Win reveal", "FOMO", "Challenge", "Tutorial", "UGC-style", "Reward", "Cinematic", "Before/After"]

Pick the hook that best describes the primary creative strategy visible in the image:
- "Gameplay demo" = shows actual gameplay, game mechanics, or game screen
- "Social proof" = shows players, reviews, ratings, download counts, or community
- "Win reveal" = shows winning moment, jackpot, big reward, celebration
- "FOMO" = urgency messaging, limited time, countdown, "last chance"
- "Challenge" = "can you beat this?", puzzle, difficulty tease
- "Tutorial" = how-to, step-by-step, guide, tips
- "UGC-style" = looks user-generated, casual/authentic, selfie-style
- "Reward" = free coins, bonuses, gift boxes, incentive-focused
- "Cinematic" = high-production trailer, storytelling, narrative
- "Before/After" = comparison, transformation, progress showcase

Context: This is a ${creativeMetadata.format || 'video'} ad on ${creativeMetadata.network || 'unknown network'}, duration ${creativeMetadata.duration_seconds || '?'}s.

Return ONLY valid JSON, no markdown or explanation.`;

  const body = {
    contents: [{
      parts: [
        {
          inlineData: {
            mimeType: imageData.contentType,
            data: imageData.base64
          }
        },
        { text: prompt }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 300
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw { status: res.status, message: `Gemini API error: ${res.status}`, detail: errText };
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Parse JSON from response (strip markdown fences if present)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return badRequest(res, 'POST only');

  try {
    const { creative_ids, app_id, limit: maxItems = 20 } = req.body || {};
    if (!app_id && (!creative_ids || !creative_ids.length)) {
      return badRequest(res, 'Provide app_id or creative_ids');
    }

    const apiKey = getGeminiKey();
    const supabase = getSupabase();
    const start = Date.now();

    // Fetch creatives
    let query = supabase.from('creatives').select('*');
    if (creative_ids && creative_ids.length > 0) {
      query = query.in('id', creative_ids);
    } else {
      query = query.eq('app_id', app_id);
    }
    query = query.not('thumbnail_url', 'is', null).limit(maxItems);

    const { data: creatives, error } = await query;
    if (error) throw error;

    if (!creatives || creatives.length === 0) {
      return ok(res, { tagged: 0, message: 'No creatives with thumbnails to tag' });
    }

    let tagged = 0;
    let totalTags = 0;
    const errors = [];

    // Process creatives (sequentially to respect rate limits)
    for (const creative of creatives) {
      try {
        const imageData = await fetchImageBase64(creative.thumbnail_url);
        if (!imageData) {
          errors.push({ id: creative.id, error: 'Failed to fetch thumbnail' });
          continue;
        }

        const result = await classifyWithGemini(apiKey, imageData, creative);
        if (!result) {
          errors.push({ id: creative.id, error: 'Failed to parse Gemini response' });
          continue;
        }

        // Build hook tag row only
        const tagRows = [];
        if (result.hook) tagRows.push({ creative_id: creative.id, tag_type: 'hook', tag_value: result.hook, confidence: 0.9, source: 'gemini-vision' });

        if (tagRows.length > 0) {
          const { error: insertErr } = await supabase
            .from('creative_tags')
            .upsert(tagRows, { onConflict: 'creative_id,tag_type,tag_value', ignoreDuplicates: false });

          if (!insertErr) {
            totalTags += tagRows.length;
            tagged++;
          } else {
            errors.push({ id: creative.id, error: insertErr.message });
          }
        }
      } catch (err) {
        errors.push({ id: creative.id, error: err.message || 'Unknown error' });
      }
    }

    await logApiCall(supabase, {
      endpoint: '/api/ai-tag-vision (gemini)',
      status: 200,
      responseMs: Date.now() - start,
      appId: app_id
    });

    return ok(res, {
      tagged,
      total_tags: totalTags,
      total_creatives: creatives.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('AI tag vision error:', err);
    return serverError(res, err);
  }
};
