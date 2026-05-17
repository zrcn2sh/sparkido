-- Ido D1 초기 스키마

CREATE TABLE IF NOT EXISTS sparks (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('solo', 'open')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'idea',
  voltage INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS labs (
  id TEXT PRIMARY KEY,
  spark_id TEXT NOT NULL REFERENCES sparks(id),
  doer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('building', 'live')),
  parent_lab_id TEXT REFERENCES labs(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lab_logs (
  id TEXT PRIMARY KEY,
  lab_id TEXT NOT NULL REFERENCES labs(id),
  step_number INTEGER NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt_text TEXT,
  code_snippet TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fuels (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  user_id TEXT NOT NULL,
  energy_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_labs_spark_id ON labs(spark_id);
CREATE INDEX IF NOT EXISTS idx_lab_logs_lab_id ON lab_logs(lab_id);
CREATE INDEX IF NOT EXISTS idx_fuels_target ON fuels(target_id, target_type);
