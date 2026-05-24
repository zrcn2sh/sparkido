-- 로그인 Fuel: 사용자·KST 일자당 1회 (race·중복 웹훅 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_fuel_ledger_earn_login_day
  ON fuel_ledger (clerk_user_id, ref_id)
  WHERE kind = 'earn_login' AND ref_type = 'login_day';
