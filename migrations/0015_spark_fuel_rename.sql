-- 포인트(전압) → Fuel 명칭 · 획득 방식 설정
ALTER TABLE sparks RENAME COLUMN voltage TO fuel;

ALTER TABLE point_settings RENAME COLUMN voltage_meter_max TO fuel_meter_max;

ALTER TABLE point_settings ADD COLUMN fuel_spark_create INTEGER NOT NULL DEFAULT 10;
ALTER TABLE point_settings ADD COLUMN fuel_lab_create INTEGER NOT NULL DEFAULT 5;
