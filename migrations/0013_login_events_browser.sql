-- 로그인 이력: 브라우저 정보 (Clerk latest_activity / User-Agent 파싱)
ALTER TABLE login_events ADD COLUMN browser TEXT;
