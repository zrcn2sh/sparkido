-- Show 타일 등록·게시 취소·전체 삭제 이력
CREATE TABLE show_tile_events (
  id TEXT PRIMARY KEY NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('register', 'cancel', 'purge_all')),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'admin', 'cron')),
  actor_user_id TEXT,
  owner_id TEXT,
  primary_tile_id TEXT,
  placement_group_id TEXT,
  tile_count INTEGER NOT NULL DEFAULT 1,
  title TEXT,
  fuel_daily INTEGER,
  fuel_period_charged INTEGER,
  refund_amount INTEGER,
  meta_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_show_tile_events_created ON show_tile_events(created_at);
CREATE INDEX idx_show_tile_events_owner ON show_tile_events(owner_id);
CREATE INDEX idx_show_tile_events_action ON show_tile_events(action);
