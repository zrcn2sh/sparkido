-- Show 타일 등록 시 소비 Fuel (월 기준) — Admin에서 조정
ALTER TABLE point_settings ADD COLUMN show_fuel_base INTEGER NOT NULL DEFAULT 10;
ALTER TABLE point_settings ADD COLUMN show_fuel_per_col INTEGER NOT NULL DEFAULT 8;
ALTER TABLE point_settings ADD COLUMN show_fuel_per_row INTEGER NOT NULL DEFAULT 8;
