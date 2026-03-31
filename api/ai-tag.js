// Build 15: AI Auto-Tagging Endpoint
// POST /api/ai-tag { creative_ids: string[] }
// Classifies creatives by hook, emotion, theme using rule-based heuristics
// (upgradeable to Claude/Gemini API later)

const { getSupabase } = require('./lib/supabase');
const { ok, badRequest, serverError } = require('./lib/respond');

// Rule-based tag taxonomy (no external AI API needed)
const HOOK_RULES = [
  { pattern: /gameplay|demo|play/i, tag: 'Gameplay demo' },
  { pattern: /social|friend|family|together/i, tag: 'Social proof' },
  { pattern: /win|reward|prize|jackpot|bonus/i, tag: 'Win reveal' },
  { pattern: /hurry|limited|now|last|ending/i, tag: 'FOMO' },
  { pattern: /challenge|puzzle|can you|try/i, tag: 'Challenge' },
  { pattern: /tutorial|how to|learn|guide/i, tag: 'Tutorial' },
];

const EMOTION_RULES = [
  { pattern: /excit|thrill|wow|amazing/i, tag: 'Excitement' },
  { pattern: /nostalg|remember|classic|tradition/i, tag: 'Nostalgia' },
  { pattern: /compet|beat|versus|rival/i, tag: 'Competition' },
  { pattern: /relax|chill|calm|easy/i, tag: 'Relaxation' },
  { pattern: /curious|mystery|secret|hidden/i, tag: 'Curiosity' },
];

function classifyCreative(creative) {
  const text = [
    creative.format || '',
    creative.network || '',
    creative.sensor_tower_creative_id || '',
  ].join(' ').toLowerCase();

  const tags = [];

  // Duration-based heuristics
  const dur = creative.duration_seconds || 0;
  if (dur <= 10) tags.push({ type: 'hook', value: 'Short-form hook', confidence: 0.7 });
  if (dur > 30) tags.push({ type: 'hook', value: 'Long-form demo', confidence: 0.7 });

  // Format-based
  if (creative.format === 'video') {
    tags.push({ type: 'theme', value: 'Video creative', confidence: 0.9 });
    if (dur >= 15 && dur <= 30) {
      tags.push({ type: 'hook', value: 'Gameplay demo', confidence: 0.75 });
    }
  } else if (creative.format === 'image') {
    tags.push({ type: 'theme', value: 'Static creative', confidence: 0.9 });
    tags.push({ type: 'hook', value: 'Visual hook', confidence: 0.7 });
  } else if (creative.format === 'playable') {
    tags.push({ type: 'hook', value: 'Interactive demo', confidence: 0.85 });
  }

  // Status-based
  if (creative.status === 'decay') {
    tags.push({ type: 'stage', value: 'Fatigue risk', confidence: 0.8 });
  } else if (creative.status === 'scaling') {
    tags.push({ type: 'stage', value: 'Scaling', confidence: 0.9 });
  } else if (creative.status === 'testing') {
    tags.push({ type: 'stage', value: 'Testing', confidence: 0.9 });
  }

  // Rule-based text matching
  for (const rule of HOOK_RULES) {
    if (rule.pattern.test(text)) {
      tags.push({ type: 'hook', value: rule.tag, confidence: 0.7 });
    }
  }
  for (const rule of EMOTION_RULES) {
    if (rule.pattern.test(text)) {
      tags.push({ type: 'emotion', value: rule.tag, confidence: 0.65 });
    }
  }

  // Default if no hook detected
  if (!tags.find(t => t.type === 'hook')) {
    tags.push({ type: 'hook', value: 'Unclassified', confidence: 0.5 });
  }

  return tags;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return badRequest(res, 'POST only');

  try {
    const { creative_ids, app_id } = req.body || {};
    const supabase = getSupabase();

    // Fetch creatives to tag
    let query = supabase.from('creatives').select('*');
    if (creative_ids && creative_ids.length > 0) {
      query = query.in('id', creative_ids);
    } else if (app_id) {
      query = query.eq('app_id', app_id).is('id', null); // untagged only via left join
    } else {
      return badRequest(res, 'Provide creative_ids or app_id');
    }

    const { data: creatives, error } = await query.limit(100);
    if (error) throw error;

    if (!creatives || creatives.length === 0) {
      return ok(res, { tagged: 0, message: 'No creatives to tag' });
    }

    // Classify and batch insert tags
    let totalTags = 0;
    for (const creative of creatives) {
      const tags = classifyCreative(creative);
      if (tags.length === 0) continue;

      const tagRows = tags.map(t => ({
        creative_id: creative.id,
        tag_type: t.type,
        tag_value: t.value,
        confidence: t.confidence,
        source: 'ai',
      }));

      const { error: insertErr } = await supabase
        .from('creative_tags')
        .upsert(tagRows, { onConflict: 'creative_id,tag_type,tag_value', ignoreDuplicates: true });

      if (!insertErr) totalTags += tagRows.length;
    }

    return ok(res, { tagged: creatives.length, total_tags: totalTags });
  } catch (err) {
    console.error('AI tag error:', err);
    return serverError(res, err.message);
  }
};
