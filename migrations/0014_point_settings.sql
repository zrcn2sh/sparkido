-- 포인트(전압) 관리 기준 — claude.md Fuel & Boost · Voltage · 주요 기여자
CREATE TABLE IF NOT EXISTS point_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  voltage_meter_max INTEGER NOT NULL DEFAULT 100,
  fuel_cheer_voltage INTEGER NOT NULL DEFAULT 1,
  fuel_tech_voltage INTEGER NOT NULL DEFAULT 2,
  fuel_market_voltage INTEGER NOT NULL DEFAULT 3,
  max_fuel_per_user_per_spark_day INTEGER NOT NULL DEFAULT 10,
  max_fuel_per_user_day INTEGER NOT NULL DEFAULT 30,
  top_contributor_min_labs INTEGER NOT NULL DEFAULT 2,
  top_contributor_display_count INTEGER NOT NULL DEFAULT 3,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

INSERT OR IGNORE INTO point_settings (
  id,
  voltage_meter_max,
  fuel_cheer_voltage,
  fuel_tech_voltage,
  fuel_market_voltage,
  max_fuel_per_user_per_spark_day,
  max_fuel_per_user_day,
  top_contributor_min_labs,
  top_contributor_display_count,
  updated_at,
  updated_by
) VALUES (
  'default',
  100,
  1,
  2,
  3,
  10,
  30,
  2,
  3,
  datetime('now'),
  NULL
);
