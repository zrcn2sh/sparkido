-- Show 타일 (Fuel·갱신은 추후)
CREATE TABLE IF NOT EXISTS show_tiles (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  page_index INTEGER NOT NULL,
  col INTEGER NOT NULL,
  row INTEGER NOT NULL,
  width INTEGER NOT NULL CHECK (width >= 1 AND width <= 6),
  height INTEGER NOT NULL CHECK (height >= 1 AND height <= 9),
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('app', 'web')),
  category TEXT NOT NULL CHECK (
    category IN ('saas', 'app', 'web', 'opensource', 'other')
  ),
  image_url TEXT,
  icon_text TEXT,
  link_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_show_tiles_page_status ON show_tiles (page_index, status);
CREATE INDEX IF NOT EXISTS idx_show_tiles_owner ON show_tiles (owner_id, status);
