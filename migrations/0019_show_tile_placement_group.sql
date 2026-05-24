-- 인접 페이지(P1·P2 등)에 걸친 타일 — 동일 그룹으로 연결
ALTER TABLE show_tiles ADD COLUMN placement_group_id TEXT;

CREATE INDEX IF NOT EXISTS idx_show_tiles_placement_group
  ON show_tiles (placement_group_id);
