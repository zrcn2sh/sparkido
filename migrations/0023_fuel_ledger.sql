-- 사용자 Fuel 적립·사용·환불 원장 (잔액은 user_fuel, 이력은 본 테이블)
CREATE TABLE IF NOT EXISTS fuel_ledger (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  delta_available INTEGER NOT NULL,
  delta_total INTEGER NOT NULL DEFAULT 0,
  available_after INTEGER NOT NULL,
  total_after INTEGER NOT NULL,
  ref_type TEXT,
  ref_id TEXT,
  related_ledger_id TEXT,
  meta_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fuel_ledger_user_created
  ON fuel_ledger (clerk_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fuel_ledger_ref
  ON fuel_ledger (ref_type, ref_id);

CREATE INDEX IF NOT EXISTS idx_fuel_ledger_related
  ON fuel_ledger (related_ledger_id);
