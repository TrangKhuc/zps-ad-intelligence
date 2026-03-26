// ZPS Ad Intelligence — Real Data Module
// Source: Sensor Tower export · Jan 1 – Mar 23, 2026
// Update this file each week after uploading new ST exports

export const APP_DATA = {
  "Conquian Zingplay": {
    source: "Sensor Tower", period: "Jan 1 – Mar 23, 2026",
    chi: 67.5,
    chi_sub: { active_rate: 43.2, hook_diversity: 100, outperform: 57.0, refresh: 100 },
    crei: 72.2,
    crei_sub: { momentum: 100.0, engagement: 44.1, stability: 67.2, wow_pct: -4.7 },
    total_downloads: 283617, total_revenue: 109020,
    monthly_downloads: { "2026-01": 118989, "2026-02": 100959, "2026-03": 63669 },
    monthly_revenue:   { "2026-01": 47993,  "2026-02": 35098,  "2026-03": 25928 },
    channel_pct: { "Organic Search": 43.5, "Organic Browse": 10.8, "Paid Display": 34.8, "Paid Search": 4.1, "Web Browser": 6.8 },
    stage_counts: { Launch: 78, Testing: 89, Scaling: 61, Decay: 160 },
    weekly_labels:    ["W1 Jan","W2 Jan","W3 Jan","W4 Jan","W1 Feb","W2 Feb","W3 Feb","W4 Feb","W1 Mar","W2 Mar","W3 Mar"],
    weekly_launches:  [17, 18, 12, 34, 20, 19, 25, 16, 20, 19, 24],
    weekly_downloads: [28559, 23986, 26361, 31258, 30424, 22469, 24403, 21734, 19796, 19730, 18801],
    vid_buckets: { "≤10s": 23, "11-20s": 72, "21-30s": 171, ">30s": 44 },
    top_countries_dl:  { MX: 195619, US: 86996, SV: 331, GT: 204, AR: 173 },
    top_countries_rev: { US: 91871, MX: 16680, CO: 165, CA: 105, ES: 100 },
    total_creatives: 388, active_now: 126, hhi: 0.328,
    networks: ["Facebook", "Instagram", "Meta Audience Network"],
    top_creatives: [
      { id: "17afbccad8164b4b", type: "video", duration: 359, first_seen: "2025-03-27", last_seen: "2026-03-21", video_dur: 26.6, stage: "Decay",   tags: ["Gameplay demo","Excitement","Fatigue risk"] },
      { id: "a462798bcef85add", type: "video", duration: 359, first_seen: "2025-03-27", last_seen: "2026-03-21", video_dur: 27.2, stage: "Decay",   tags: ["Gameplay demo","Excitement","Fatigue risk"] },
      { id: "07c14c0178cda776", type: "video", duration: 226, first_seen: "2025-08-07", last_seen: "2026-03-21", video_dur: 26.7, stage: "Decay",   tags: ["Gameplay demo","Social proof"] },
      { id: "01b2ddc3d6f79b5d", type: "video", duration: 72,  first_seen: "2026-01-11", last_seen: "2026-03-24", video_dur: 13.1, stage: "Scaling", tags: ["Win reveal","Short-form","Scaling"] },
      { id: "0eab42cb611a90aa", type: "video", duration: 7,   first_seen: "2026-03-17", last_seen: "2026-03-24", video_dur: 16.5, stage: "Launch",  tags: ["Social proof","Short-form","Launch"] }
    ]
  }
};

export const FILTER_OPTIONS = {
  appType:     ["Conquian Zingplay", "ZPS Poker", "ZPS Bài Cào"],
  category:    ["Card Games", "Casino", "Board Games"],
  region:      ["MX (Mexico)", "US", "Latam (other)", "SEA", "All regions"],
  network:     ["Facebook", "Instagram", "Meta Audience Network", "TikTok", "Google UAC", "AppLovin"],
  creativeTag: ["Social proof","Gameplay demo","Win/Reward reveal","FOMO/Urgency","Challenge/Puzzle","Tutorial/How-to"],
  creativeType:["Video","Image","Playable","Carousel"],
  hook:        ["Excitement/Thrill","Nostalgia","Competitiveness","Relaxation","Social connection"],
  stage:       ["Launch (<7d)","Testing (7-21d)","Scaling (21-60d)","Decay (>60d)"],
  duration:    ["≤10s","11-20s","21-30s",">30s","Image (no duration)"]
};

export const FORMULAS = {
  CHI: {
    label: "Creative Health Index",
    description: "Portfolio này đang khỏe không?",
    weights: { active_rate: 0.30, hook_diversity: 0.25, outperform_rate: 0.25, refresh_cadence: 0.20 },
    definitions: {
      active_rate:     "% creatives với last_seen ≤ 3d trước / total trong 30d",
      hook_diversity:  "min(unique hook categories / 5, 1) × 100",
      outperform_rate: "% creatives với life_cycle > genre median (casual: 21d)",
      refresh_cadence: "min(genre_median_weekly / avg_days_between_launches, 1) × 100"
    }
  },
  CREI: {
    label: "Creative Risk & Engagement Index",
    description: "Đang hung hãn hay phòng thủ?",
    weights: { momentum: 0.40, engagement_delta: 0.35, channel_stability: 0.25 },
    definitions: {
      momentum:          "min(new_creatives/week / genre_median × 1.5, 1.5) / 1.5 × 100",
      engagement_delta:  "sigmoid(WoW download change%) × 100 — 50 = no change",
      channel_stability: "(1 − HHI) × 100, HHI = Σ(channel_share²)"
    }
  }
};
