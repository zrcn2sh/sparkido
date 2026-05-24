-- Show 타일 써봤어요·추천해요 (placement_group_id 또는 tile id 기준 집계)
CREATE TABLE IF NOT EXISTS show_tile_reactions (
  id TEXT PRIMARY KEY,
  target_key TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('tried', 'recommend')),
  created_at TEXT NOT NULL,
  UNIQUE (clerk_user_id, target_key, reaction)
);

CREATE INDEX IF NOT EXISTS idx_show_tile_reactions_target
  ON show_tile_reactions (target_key, reaction);
