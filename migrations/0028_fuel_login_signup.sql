-- 로그인·회원가입 Fuel 적립 (Admin 설정)
ALTER TABLE point_settings ADD COLUMN fuel_login INTEGER NOT NULL DEFAULT 1;
ALTER TABLE point_settings ADD COLUMN fuel_signup INTEGER NOT NULL DEFAULT 10;
