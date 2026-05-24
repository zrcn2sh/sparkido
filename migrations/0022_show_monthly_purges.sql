-- 매월 1일(KST) Cron 삭제 멱등 기록
CREATE TABLE IF NOT EXISTS show_monthly_purges (
  year_month TEXT PRIMARY KEY,
  purged_at TEXT NOT NULL,
  tiles_removed INTEGER NOT NULL DEFAULT 0
);
