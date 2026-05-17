-- 게시판 카테고리: notice | qna | free

ALTER TABLE board_posts ADD COLUMN category TEXT NOT NULL DEFAULT 'free'
  CHECK (category IN ('notice', 'qna', 'free'));

CREATE INDEX IF NOT EXISTS idx_board_posts_category_created
  ON board_posts(category, created_at DESC);
