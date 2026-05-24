-- Show 타일 등록 허용 최대 크기 (칸) — Admin에서 조정
ALTER TABLE point_settings ADD COLUMN show_tile_max_cols INTEGER NOT NULL DEFAULT 4;
ALTER TABLE point_settings ADD COLUMN show_tile_max_rows INTEGER NOT NULL DEFAULT 4;
