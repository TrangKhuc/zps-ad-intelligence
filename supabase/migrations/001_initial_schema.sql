-- ZPS Ad Intelligence — Initial Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
-- Created: 2026-03-30

-- ============================================================
-- 1. watchlist_apps — Core app registry
-- ============================================================
CREATE TABLE watchlist_apps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_tower_id TEXT NOT NULL UNIQUE,
  app_name      TEXT NOT NULL,
  publisher     TEXT,
  platform      TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'unified')),
  icon_url      TEXT,
  color         TEXT DEFAULT '#4d65ff',  -- chip color in UI
  added_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ
);

CREATE INDEX idx_watchlist_apps_st_id ON watchlist_apps(sensor_tower_id);

-- ============================================================
-- 2. app_snapshots — Point-in-time metrics per sync
-- ============================================================
CREATE TABLE app_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id          UUID NOT NULL REFERENCES watchlist_apps(id) ON DELETE CASCADE,
  snapshot_date   DATE NOT NULL,
  downloads       BIGINT DEFAULT 0,
  revenue_cents   BIGINT DEFAULT 0,       -- stored in cents to avoid float issues
  active_creatives INT DEFAULT 0,
  total_creatives  INT DEFAULT 0,
  chi_score       NUMERIC(5,2),           -- 0.00 – 100.00
  crei_score      NUMERIC(5,2),
  networks_count  INT DEFAULT 0,
  primary_network TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_snapshots_app_date ON app_snapshots(app_id, snapshot_date DESC);

-- ============================================================
-- 3. app_markets — Market breakdown per snapshot
-- ============================================================
CREATE TABLE app_markets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id   UUID NOT NULL REFERENCES app_snapshots(id) ON DELETE CASCADE,
  country_code  TEXT NOT NULL,             -- ISO 3166-1 alpha-2 (US, MX, UK, etc.)
  downloads     BIGINT DEFAULT 0,
  revenue_cents BIGINT DEFAULT 0,
  rpd_cents     INT DEFAULT 0,             -- revenue per download in cents
  share_pct     NUMERIC(5,2) DEFAULT 0     -- percentage of total downloads
);

CREATE INDEX idx_markets_snapshot ON app_markets(snapshot_id);

-- ============================================================
-- 4. creatives — Individual ad creatives
-- ============================================================
CREATE TABLE creatives (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id                  UUID NOT NULL REFERENCES watchlist_apps(id) ON DELETE CASCADE,
  sensor_tower_creative_id TEXT UNIQUE,
  format                  TEXT CHECK (format IN ('video', 'image', 'playable', 'html', 'other')),
  network                 TEXT,            -- Meta, Google Ads, TikTok Ads, Unity, AppLovin, etc.
  platform                TEXT CHECK (platform IN ('ios', 'android', 'web')),
  duration_seconds        INT,
  first_seen              DATE,
  last_seen               DATE,
  status                  TEXT DEFAULT 'active' CHECK (status IN ('active', 'testing', 'scaling', 'decay')),
  thumbnail_url           TEXT,
  preview_url             TEXT,
  title                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_creatives_app ON creatives(app_id);
CREATE INDEX idx_creatives_status ON creatives(app_id, status);
CREATE INDEX idx_creatives_network ON creatives(app_id, network);
CREATE INDEX idx_creatives_first_seen ON creatives(app_id, first_seen DESC);

-- ============================================================
-- 5. creative_tags — AI-generated and manual tags
-- ============================================================
CREATE TABLE creative_tags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id   UUID NOT NULL REFERENCES creatives(id) ON DELETE CASCADE,
  tag_type      TEXT NOT NULL CHECK (tag_type IN ('hook', 'emotion', 'theme', 'stage', 'quality')),
  tag_value     TEXT NOT NULL,
  confidence    NUMERIC(3,2) DEFAULT 1.00, -- 0.00 – 1.00
  source        TEXT DEFAULT 'manual' CHECK (source IN ('ai', 'manual')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tags_creative ON creative_tags(creative_id);
CREATE INDEX idx_tags_type_value ON creative_tags(tag_type, tag_value);

-- ============================================================
-- 6. network_impressions — Monthly impressions by ad network
-- ============================================================
CREATE TABLE network_impressions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id      UUID NOT NULL REFERENCES watchlist_apps(id) ON DELETE CASCADE,
  network     TEXT NOT NULL,
  month       DATE NOT NULL,               -- first day of month (2026-01-01, etc.)
  impressions BIGINT DEFAULT 0,
  UNIQUE(app_id, network, month)
);

CREATE INDEX idx_impressions_app ON network_impressions(app_id, month DESC);

-- ============================================================
-- 7. action_queue — Playbook recommended actions
-- ============================================================
CREATE TABLE action_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id        UUID NOT NULL REFERENCES watchlist_apps(id) ON DELETE CASCADE,
  priority      TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  tier          TEXT DEFAULT 'monitor' CHECK (tier IN ('this_week', 'next_2_weeks', 'monitor')),
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'dismissed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

CREATE INDEX idx_actions_app_status ON action_queue(app_id, status);

-- ============================================================
-- 8. api_usage — Track Sensor Tower API calls
-- ============================================================
CREATE TABLE api_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint        TEXT NOT NULL,
  called_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_status INT,
  response_ms     INT,                      -- response time in milliseconds
  app_id          UUID REFERENCES watchlist_apps(id) ON DELETE SET NULL
);

CREATE INDEX idx_api_usage_date ON api_usage(called_at DESC);

-- ============================================================
-- Row Level Security (RLS)
-- For now, allow all access (single-user app).
-- When multi-user is needed, add user_id column + policies.
-- ============================================================
ALTER TABLE watchlist_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Permissive policies: allow all operations via service_role key (serverless functions)
-- The anon key should NOT have direct table access — all queries go through API
CREATE POLICY "Service role full access" ON watchlist_apps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON app_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON app_markets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON creatives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON creative_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON network_impressions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON action_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON api_usage FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Helper view: latest snapshot per app (for Intel Rail)
-- ============================================================
CREATE VIEW latest_snapshots AS
SELECT DISTINCT ON (app_id)
  s.*,
  a.app_name,
  a.sensor_tower_id,
  a.color
FROM app_snapshots s
JOIN watchlist_apps a ON a.id = s.app_id
ORDER BY app_id, snapshot_date DESC;

-- ============================================================
-- Helper view: API usage summary (current month)
-- ============================================================
CREATE VIEW api_usage_current_month AS
SELECT
  COUNT(*) AS total_calls,
  COUNT(*) FILTER (WHERE response_status >= 200 AND response_status < 300) AS success_calls,
  COUNT(*) FILTER (WHERE response_status >= 400) AS error_calls,
  AVG(response_ms) AS avg_response_ms
FROM api_usage
WHERE called_at >= date_trunc('month', CURRENT_DATE);
