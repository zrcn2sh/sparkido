import { createId } from '@/lib/id'
import { getDb } from '@/lib/db'
import type { LabLog, LabLogType } from '@/types'

type LabLogRow = {
  id: string
  lab_id: string
  step_number: number
  type: string
  content: string
  prompt_text: string | null
  code_snippet: string | null
  created_at: string
}

export type CreateLabLogInput = {
  type: LabLogType
  content: string
  promptText?: string
  codeSnippet?: string
}

function mapLogRow(row: LabLogRow): LabLog {
  return {
    id: row.id,
    labId: row.lab_id,
    stepNumber: row.step_number,
    type: row.type as LabLog['type'],
    content: row.content,
    promptText: row.prompt_text,
    codeSnippet: row.code_snippet,
    createdAt: row.created_at,
  }
}

async function getOrCreatePrimaryLab(
  sparkId: string,
  doerId: string,
): Promise<string> {
  const db = await getDb()
  const existing = await db
    .prepare(
      `SELECT id FROM labs WHERE spark_id = ? AND doer_id = ? LIMIT 1`,
    )
    .bind(sparkId, doerId)
    .first<{ id: string }>()

  if (existing) return existing.id

  const labId = createId()
  await db
    .prepare(
      `INSERT INTO labs (id, spark_id, doer_id, status, parent_lab_id, created_at)
       VALUES (?, ?, ?, 'building', NULL, datetime('now'))`,
    )
    .bind(labId, sparkId, doerId)
    .run()

  return labId
}

export async function listLabLogsBySparkId(
  sparkId: string,
): Promise<LabLog[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT ll.id, ll.lab_id, ll.step_number, ll.type, ll.content,
              ll.prompt_text, ll.code_snippet, ll.created_at
       FROM lab_logs ll
       INNER JOIN labs l ON l.id = ll.lab_id
       WHERE l.spark_id = ?
       ORDER BY ll.created_at ASC`,
    )
    .bind(sparkId)
    .all<LabLogRow>()

  return (results ?? []).map(mapLogRow)
}

export async function createLabLog(
  sparkId: string,
  input: CreateLabLogInput,
  doerId: string,
): Promise<LabLog> {
  const db = await getDb()
  const labId = await getOrCreatePrimaryLab(sparkId, doerId)

  const stepRow = await db
    .prepare(
      `SELECT COALESCE(MAX(step_number), 0) + 1 AS next_step
       FROM lab_logs WHERE lab_id = ?`,
    )
    .bind(labId)
    .first<{ next_step: number }>()

  const stepNumber = stepRow?.next_step ?? 1
  const id = createId()

  await db
    .prepare(
      `INSERT INTO lab_logs (id, lab_id, step_number, type, content, prompt_text, code_snippet, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .bind(
      id,
      labId,
      stepNumber,
      input.type,
      input.content.trim(),
      input.promptText?.trim() ?? null,
      input.codeSnippet?.trim() ?? null,
    )
    .run()

  const row = await db
    .prepare(
      `SELECT id, lab_id, step_number, type, content, prompt_text, code_snippet, created_at
       FROM lab_logs WHERE id = ?`,
    )
    .bind(id)
    .first<LabLogRow>()

  if (!row) throw new Error('Lab log 생성 후 조회에 실패했습니다.')
  return mapLogRow(row)
}
