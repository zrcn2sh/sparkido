-- Lab마다 진행 단계 저장 + Spark stage 값 정리 (Idea / Validate / Build / Live)

ALTER TABLE lab_logs ADD COLUMN stage TEXT NOT NULL DEFAULT 'build';

UPDATE sparks SET stage = 'validate' WHERE stage = 'validating';
UPDATE sparks SET stage = 'build' WHERE stage = 'building';
UPDATE sparks SET stage = 'live' WHERE stage = 'launched';

UPDATE sparks
SET stage = 'idea'
WHERE id NOT IN (
  SELECT DISTINCT spark_id FROM labs
);
