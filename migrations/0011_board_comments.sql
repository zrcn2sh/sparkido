-- 게시판 댓글
CREATE TABLE IF NOT EXISTS board_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES board_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_board_comments_post_id ON board_comments(post_id, created_at ASC);
