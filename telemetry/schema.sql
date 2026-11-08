PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS visitors (
  wbuid TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  device TEXT NOT NULL CHECK(device IN ('desktop','mobile','tablet','unknown')),
  language TEXT NOT NULL,
  screen_width INTEGER NOT NULL,
  screen_height INTEGER NOT NULL,
  consent_version TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wbuid TEXT NOT NULL REFERENCES visitors(wbuid) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK(event_type IN ('page_view','section_view','js_error','performance')),
  page TEXT NOT NULL,
  created_at TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_wbuid ON events(wbuid);

CREATE TABLE IF NOT EXISTS rate_limits (wbuid TEXT PRIMARY KEY, window_minute INTEGER NOT NULL, hits INTEGER NOT NULL DEFAULT 0);

CREATE TABLE IF NOT EXISTS consent_metrics (day TEXT NOT NULL, decision TEXT NOT NULL CHECK(decision IN ('accepted','declined')), version TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY(day,decision,version));

CREATE TABLE IF NOT EXISTS ip_rate_limits (ip_hash TEXT PRIMARY KEY, window_minute INTEGER NOT NULL, hits INTEGER NOT NULL DEFAULT 0);
