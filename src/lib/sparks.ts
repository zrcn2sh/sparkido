import { nowKstIso } from '@/lib/datetime'
import { normalizeSparkStage } from '@/lib/spark-stages'
import { canSetSparkMode } from '@/lib/spark-permissions'
import { createId } from '@/lib/id'
import { getDb } from '@/lib/db'
import {
  SPARK_FIELD_LIMITS,
  validateCreateSparkInput,
  validateUpdateSparkInput,
  type UpdateSparkInput,
  type ValidatedUpdateSparkInput,
} from '@/lib/spark-form'
import { parseSparkContent } from '@/lib/spark-content'
import { assertValidUtf8Text } from '@/lib/text'

export { parseSparkContent } from '@/lib/spark-content'

import type {
  Spark,
  SparkContent,
  SparkMode,
  SparkStage,
  SparkVisibility,
} from '@/types'

type SparkRow = {
  id: string
  author_id: string
  mode: SparkMode
  visibility: SparkVisibility
  title: string
  content: string
  stage: SparkStage
  voltage: number
  created_at: string
  updated_at: string
}

const SPARK_SELECT = `id, author_id, mode, visibility, title, content, stage, voltage, created_at, updated_at`

export type CreateSparkInput = {
  title: string
  problem: string
  audience: string
  solution: string
  notes?: string
  mode: SparkMode
}

export type { UpdateSparkInput }

function mapRow(row: SparkRow): Spark {
  return {
    id: row.id,
    authorId: row.author_id,
    mode: row.mode,
    visibility: row.visibility ?? 'public',
    title: row.title,
    content: row.content,
    stage: normalizeSparkStage(row.stage),
    voltage: row.voltage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function buildContent(input: CreateSparkInput): string {
  const payload: SparkContent = {
    problem: assertValidUtf8Text(input.problem, '문제 설명'),
    audience: assertValidUtf8Text(input.audience, '타깃 사용자'),
    solution: assertValidUtf8Text(input.solution, '해결 방안'),
  }
  if (input.notes?.trim()) {
    payload.notes = assertValidUtf8Text(input.notes, '기타 내용')
  }
  return JSON.stringify(payload, null, 0)
}

function mergeNotesIntoContent(
  existingRaw: string,
  notes: string | undefined,
): string {
  const payload = parseSparkContent(existingRaw)
  if (notes === undefined) return JSON.stringify(payload, null, 0)

  const trimmed = notes.trim()
  if (trimmed) {
    payload.notes = assertValidUtf8Text(
      trimmed.slice(0, SPARK_FIELD_LIMITS.notes),
      '기타 내용',
    )
  } else {
    delete payload.notes
  }
  return JSON.stringify(payload, null, 0)
}

function buildTitle(title: string): string {
  return assertValidUtf8Text(
    title.slice(0, SPARK_FIELD_LIMITS.title),
    'Spark 제목',
  )
}

export async function listSparks(viewerId?: string | null): Promise<Spark[]> {
  const db = await getDb()

  if (viewerId) {
    const { results } = await db
      .prepare(
        `SELECT ${SPARK_SELECT}
         FROM sparks
         WHERE visibility = 'public' OR author_id = ?
         ORDER BY created_at DESC`,
      )
      .bind(viewerId)
      .all<SparkRow>()
    return (results ?? []).map(mapRow)
  }

  const { results } = await db
    .prepare(
      `SELECT ${SPARK_SELECT}
       FROM sparks
       WHERE visibility = 'public'
       ORDER BY created_at DESC`,
    )
    .all<SparkRow>()

  return (results ?? []).map(mapRow)
}

export async function getSparkById(id: string): Promise<Spark | null> {
  const db = await getDb()
  const row = await db
    .prepare(`SELECT ${SPARK_SELECT} FROM sparks WHERE id = ?`)
    .bind(id)
    .first<SparkRow>()

  return row ? mapRow(row) : null
}

export async function createSpark(
  input: CreateSparkInput,
  authorId: string,
): Promise<Spark> {
  const validated = validateCreateSparkInput(input)
  if (!validated.ok) {
    throw new Error(validated.error)
  }

  const db = await getDb()
  const id = createId()
  const title = buildTitle(validated.data.title)
  const content = buildContent(validated.data)
  const now = nowKstIso()

  await db
    .prepare(
      `INSERT INTO sparks (id, author_id, mode, visibility, title, content, stage, voltage, created_at, updated_at)
       VALUES (?, ?, ?, 'public', ?, ?, ?, 0, ?, ?)`,
    )
    .bind(id, authorId, validated.data.mode, title, content, 'idea', now, now)
    .run()

  return {
    id,
    authorId,
    mode: validated.data.mode,
    visibility: 'public',
    title,
    content,
    stage: 'idea',
    voltage: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateSpark(
  sparkId: string,
  authorId: string,
  input: ValidatedUpdateSparkInput,
): Promise<Spark> {
  const existing = await getSparkById(sparkId)
  if (!existing) {
    throw new Error('Spark를 찾을 수 없습니다.')
  }
  if (existing.authorId !== authorId) {
    throw new Error('Spark 작성자만 수정할 수 있습니다.')
  }

  if (input.mode !== undefined) {
    const modeCheck = await canSetSparkMode(existing, input.mode)
    if (!modeCheck.ok) {
      throw new Error(modeCheck.error)
    }
  }

  const db = await getDb()
  const now = nowKstIso()
  const title = input.title !== undefined ? buildTitle(input.title) : existing.title
  const content =
    input.notes !== undefined
      ? mergeNotesIntoContent(existing.content, input.notes)
      : existing.content
  const mode = input.mode ?? existing.mode
  const visibility = input.visibility ?? existing.visibility

  await db
    .prepare(
      `UPDATE sparks
       SET title = ?, content = ?, mode = ?, visibility = ?, updated_at = ?
       WHERE id = ? AND author_id = ?`,
    )
    .bind(title, content, mode, visibility, now, sparkId, authorId)
    .run()

  const updated = await getSparkById(sparkId)
  if (!updated) throw new Error('Spark 수정 후 조회에 실패했습니다.')
  return updated
}

export function applySparkUpdateInput(
  body: unknown,
): ValidatedUpdateSparkInput {
  const validated = validateUpdateSparkInput(
    body as Partial<UpdateSparkInput>,
  )
  if (!validated.ok) {
    throw new Error(validated.error)
  }
  return validated.data
}
