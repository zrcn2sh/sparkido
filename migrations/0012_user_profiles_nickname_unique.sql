-- 별명 중복 방지 (대소문자 구분 — 앱에서 LOWER 비교 추가)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_nickname_unique ON user_profiles(nickname);
