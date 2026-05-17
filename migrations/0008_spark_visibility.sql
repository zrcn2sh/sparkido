-- Spark 비공개 전환 (삭제 대신 visibility)
ALTER TABLE sparks ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'private'));
