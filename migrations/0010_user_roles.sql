-- 사용자 권한: admin | member (기본 member)
ALTER TABLE user_profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'member';

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
