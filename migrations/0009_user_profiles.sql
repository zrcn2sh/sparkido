-- Clerk 사용자 별명 (화면 표시명)
CREATE TABLE IF NOT EXISTS user_profiles (
  clerk_user_id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname ON user_profiles(nickname);
