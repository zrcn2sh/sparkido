-- Show 타일 등록 시 Fuel 청구 스냅샷 (미사용 일수 환불 계산용)
ALTER TABLE show_tiles ADD COLUMN fuel_ledger_id TEXT;
ALTER TABLE show_tiles ADD COLUMN fuel_daily INTEGER;
ALTER TABLE show_tiles ADD COLUMN fuel_period_charged INTEGER;
ALTER TABLE show_tiles ADD COLUMN fuel_billing_month TEXT;
ALTER TABLE show_tiles ADD COLUMN fuel_remaining_days INTEGER;
