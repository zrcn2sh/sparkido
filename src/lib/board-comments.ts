import { nowKstIso } from '@/lib/datetime'
import { createId } from '@/lib/id'
import { getDb } from '@/lib/db'
import { assertValidUtf8Text } from '@/lib/text'
import type { BoardComment } from '@/types'

const COMMENT_MAX_LENGTH = 2000

type BoardCommentRow = {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  updated_at: string
}

function mapRow(row: BoardCommentRow): BoardComment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function validateCommentContent(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('댓글을 입력해 주세요.')
  }
  const trimmed = raw.trim()
  if (trimmed.length > COMMENT_MAX_LENGTH) {
    throw new Error(`댓글은 ${COMMENT_MAX_LENGTH}자 이하로 입력해 주세요.`)
  }
  return assertValidUtf8Text(trimmed, '댓글')
}

export async function listBoardCommentsByPostId(
  postId: string,
): Promise<BoardComment[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT id, post_id, author_id, content, created_at, updated_at
       FROM board_comments
       WHERE post_id = ?
       ORDER BY created_at ASC`,
    )
    .bind(postId)
    .all<BoardCommentRow>()

  return (results ?? []).map(mapRow)
}

export async function getBoardCommentById(
  id: string,
): Promise<BoardComment | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT id, post_id, author_id, content, created_at, updated_at
       FROM board_comments WHERE id = ?`,
    )
    .bind(id)
    .first<BoardCommentRow>()

  return row ? mapRow(row) : null
}

export async function createBoardComment(
  postId: string,
  authorId: string,
  content: string,
): Promise<BoardComment> {
  const db = await getDb()
  const id = createId()
  const now = nowKstIso()
  const body = validateCommentContent(content)

  await db
    .prepare(
      `INSERT INTO board_comments (id, post_id, author_id, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, postId, authorId, body, now, now)
    .run()

  return {
    id,
    postId,
    authorId,
    content: body,
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateBoardComment(
  id: string,
  content: string,
): Promise<BoardComment | null> {
  const existing = await getBoardCommentById(id)
  if (!existing) return null

  const body = validateCommentContent(content)
  const now = nowKstIso()
  const db = await getDb()

  await db
    .prepare(
      `UPDATE board_comments SET content = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(body, now, id)
    .run()

  return { ...existing, content: body, updatedAt: now }
}

export async function deleteBoardComment(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db
    .prepare(`DELETE FROM board_comments WHERE id = ?`)
    .bind(id)
    .run()

  return (result.meta?.changes as number | undefined) !== 0
}

export async function deleteBoardCommentsByPostId(postId: string): Promise<void> {
  const db = await getDb()
  await db
    .prepare(`DELETE FROM board_comments WHERE post_id = ?`)
    .bind(postId)
    .run()
}
