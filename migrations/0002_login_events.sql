-- Clerk webhook 기반 로그인 이력

CREATE TABLE IF NOT EXISTS login_events (
  id TEXT PRIMARY KEY,
  clerk_event_id TEXT NOT NULL UNIQUE,
  clerk_user_id TEXT NOT NULL,
  clerk_session_id TEXT,
  event_type TEXT NOT NULL,
  signed_in_at TEXT,
  signed_out_at TEXT,
  ip_address TEXT,
  user_agent TEXT,
  city TEXT,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_login_events_user_id ON login_events(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_login_events_signed_in_at ON login_events(signed_in_at);
