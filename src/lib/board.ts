import { nowKstIso } from '@/lib/datetime'
import { createId } from '@/lib/id'
import { getDb } from '@/lib/db'
import { assertValidUtf8Text } from '@/lib/text'
import type { BoardCategory, BoardPost } from '@/types'

type BoardPostRow = {
  id: string
  author_id: string
  category: BoardCategory
  title: string
  content: string
  created_at: string
  updated_at: string
}

export type CreateBoardPostInput = {
  category: BoardCategory
  title: string
  content: string
}

export type UpdateBoardPostInput = {
  title?: string
  content?: string
}

function mapRow(row: BoardPostRow): BoardPost {
  return {
    id: row.id,
    authorId: row.author_id,
    category: row.category,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listBoardPosts(
  category: BoardCategory,
): Promise<BoardPost[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT id, author_id, category, title, content, created_at, updated_at
       FROM board_posts
       WHERE category = ?
       ORDER BY created_at DESC`,
    )
    .bind(category)
    .all<BoardPostRow>()

  return (results ?? []).map(mapRow)
}

export async function getBoardPostById(id: string): Promise<BoardPost | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT id, author_id, category, title, content, created_at, updated_at
       FROM board_posts
       WHERE id = ?`,
    )
    .bind(id)
    .first<BoardPostRow>()

  return row ? mapRow(row) : null
}

export async function createBoardPost(
  input: CreateBoardPostInput,
  authorId: string,
): Promise<BoardPost> {
  const db = await getDb()
  const id = createId()
  const now = nowKstIso()
  const title = assertValidUtf8Text(input.title, '제목')
  const content = assertValidUtf8Text(input.content, '내용')

  await db
    .prepare(
      `INSERT INTO board_posts (id, author_id, category, title, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, authorId, input.category, title, content, now, now)
    .run()

  return {
    id,
    authorId,
    category: input.category,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateBoardPost(
  id: string,
  input: UpdateBoardPostInput,
): Promise<BoardPost | null> {
  const existing = await getBoardPostById(id)
  if (!existing) return null

  const title =
    input.title !== undefined
      ? assertValidUtf8Text(input.title, '제목')
      : existing.title
  const content =
    input.content !== undefined
      ? assertValidUtf8Text(input.content, '내용')
      : existing.content
  const now = nowKstIso()

  const db = await getDb()
  await db
    .prepare(
      `UPDATE board_posts
       SET title = ?, content = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(title, content, now, id)
    .run()

  return {
    ...existing,
    title,
    content,
    updatedAt: now,
  }
}

export async function deleteBoardPost(id: string): Promise<boolean> {
  const db = await getDb()
  const result = await db
    .prepare(`DELETE FROM board_posts WHERE id = ?`)
    .bind(id)
    .run()

  return (result.meta?.changes as number | undefined) !== 0
}
