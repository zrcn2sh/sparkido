-- 서비스 알파 기간 (Show Fuel 사용 없음, 적립은 유지)
ALTER TABLE point_settings ADD COLUMN is_alpha_period INTEGER NOT NULL DEFAULT 1;
