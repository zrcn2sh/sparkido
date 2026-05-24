-- 사용자 Fuel (사용가능 / 누적)
CREATE TABLE IF NOT EXISTS user_fuel (
  clerk_user_id TEXT PRIMARY KEY,
  fuel_available INTEGER NOT NULL DEFAULT 0,
  fuel_total INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_fuel_updated ON user_fuel(updated_at);
