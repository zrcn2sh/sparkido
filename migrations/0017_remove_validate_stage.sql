-- Validate 단계 제거 → Build로 통합 (3단계: idea · build · live)
UPDATE sparks SET stage = 'build' WHERE stage IN ('validate', 'validating');
UPDATE lab_logs SET stage = 'build', type = 'build' WHERE stage IN ('validate', 'validating');
