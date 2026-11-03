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
