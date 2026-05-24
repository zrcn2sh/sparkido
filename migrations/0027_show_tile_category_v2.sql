-- Show 구분: 웹·앱·API/툴·브라우저확장·기타 (category CHECK 갱신)
PRAGMA foreign_keys = OFF;

CREATE TABLE show_tiles_new (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  placement_group_id TEXT,
  page_index INTEGER NOT NULL,
  col INTEGER NOT NULL,
  row INTEGER NOT NULL,
  width INTEGER NOT NULL CHECK (width >= 1 AND width <= 6),
  height INTEGER NOT NULL CHECK (height >= 1 AND height <= 9),
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('app', 'web')),
  category TEXT NOT NULL CHECK (
    category IN ('web', 'app', 'api_tool', 'browser_extension', 'other')
  ),
  image_url TEXT,
  icon_text TEXT,
  link_url TEXT,
  fuel_ledger_id TEXT,
  fuel_daily INTEGER,
  fuel_period_charged INTEGER,
  fuel_billing_month TEXT,
  fuel_remaining_days INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO show_tiles_new (
  id, owner_id, placement_group_id, page_index, col, row, width, height,
  title, tagline, kind, category, image_url, icon_text, link_url,
  fuel_ledger_id, fuel_daily, fuel_period_charged, fuel_billing_month,
  fuel_remaining_days, status, created_at, updated_at
)
SELECT
  id, owner_id, placement_group_id, page_index, col, row, width, height,
  title, tagline,
  CASE
    WHEN category = 'app' OR kind = 'app' THEN 'app'
    ELSE 'web'
  END,
  CASE category
    WHEN 'saas' THEN 'web'
    WHEN 'app' THEN 'app'
    WHEN 'web' THEN 'web'
    WHEN 'opensource' THEN 'api_tool'
    WHEN 'other' THEN 'other'
    ELSE 'other'
  END,
  image_url, icon_text, link_url,
  fuel_ledger_id, fuel_daily, fuel_period_charged, fuel_billing_month,
  fuel_remaining_days, status, created_at, updated_at
FROM show_tiles;

DROP TABLE show_tiles;
ALTER TABLE show_tiles_new RENAME TO show_tiles;

CREATE INDEX IF NOT EXISTS idx_show_tiles_page_status ON show_tiles (page_index, status);
CREATE INDEX IF NOT EXISTS idx_show_tiles_owner ON show_tiles (owner_id, status);
CREATE INDEX IF NOT EXISTS idx_show_tiles_placement_group
  ON show_tiles (placement_group_id);

PRAGMA foreign_keys = ON;
