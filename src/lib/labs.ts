import { nowKstIso } from '@/lib/datetime'
import { getFuelSettings } from '@/lib/fuel-settings'
import { addUserFuel } from '@/lib/user-fuel'
import { createId } from '@/lib/id'
import { getDb } from '@/lib/db'
import { assertValidUtf8Text } from '@/lib/text'
import { normalizeSparkStage } from '@/lib/spark-stages'
import { parseLabSourceUrl } from '@/lib/lab-links'
import {
  deserializeTechStack,
  serializeTechStack,
} from '@/lib/tech-stack'
import type { LabLog, SparkStage } from '@/types'

type LabLogRow = {
  id: string
  lab_id: string
  doer_id: string
  step_number: number
  stage: string
  type: string
  content: string
  tech_stack: string | null
  prompt_text: string | null
  source_url: string | null
  code_snippet: string | null
  created_at: string
}

export type CreateLabLogInput = {
  stage: SparkStage
  content: string
  techStack?: string[]
  sourceUrl?: string
  promptText?: string
}

function mapLogRow(row: LabLogRow): LabLog {
  return {
    id: row.id,
    labId: row.lab_id,
    doerId: row.doer_id,
    stepNumber: row.step_number,
    stage: normalizeSparkStage(row.stage),
    content: row.content,
    techStack: deserializeTechStack(row.tech_stack),
    sourceUrl: row.source_url,
    promptText: row.prompt_text,
    codeSnippet: row.code_snippet,
    createdAt: row.created_at,
  }
}

async function syncSparkStageFromLab(
  sparkId: string,
  stage: SparkStage,
): Promise<void> {
  const db = await getDb()
  const now = nowKstIso()
  await db
    .prepare(
      `UPDATE sparks SET stage = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(stage, now, sparkId)
    .run()
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
  const createdAt = nowKstIso()
  await db
    .prepare(
      `INSERT INTO labs (id, spark_id, doer_id, status, parent_lab_id, created_at)
       VALUES (?, ?, ?, 'building', NULL, ?)`,
    )
    .bind(labId, sparkId, doerId, createdAt)
    .run()

  return labId
}

/** Spark 작성자가 아닌 doer의 Lab이 하나라도 있으면 true */
export async function sparkHasOtherContributorLabs(
  sparkId: string,
  authorId: string,
): Promise<boolean> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT 1 AS found FROM labs
       WHERE spark_id = ? AND doer_id != ?
       LIMIT 1`,
    )
    .bind(sparkId, authorId)
    .first<{ found: number }>()

  return !!row
}

/** Spark별 참여자 수 — 작성자 + Lab doer (중복 제거) */
export async function countLabParticipantsBySparkIds(
  sparkIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  if (sparkIds.length === 0) return counts

  for (const id of sparkIds) counts[id] = 1

  const db = await getDb()
  const placeholders = sparkIds.map(() => '?').join(', ')
  const binds = [...sparkIds, ...sparkIds]
  const { results } = await db
    .prepare(
      `SELECT spark_id, COUNT(DISTINCT participant_id) AS cnt
       FROM (
         SELECT id AS spark_id, author_id AS participant_id
         FROM sparks
         WHERE id IN (${placeholders})
         UNION
         SELECT spark_id, doer_id AS participant_id
         FROM labs
         WHERE spark_id IN (${placeholders})
       ) AS participants
       GROUP BY spark_id`,
    )
    .bind(...binds)
    .all<{ spark_id: string; cnt: number }>()

  for (const row of results ?? []) {
    counts[row.spark_id] = row.cnt
  }
  return counts
}

export async function listLabLogsBySparkId(
  sparkId: string,
): Promise<LabLog[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT ll.id, ll.lab_id, l.doer_id, ll.step_number, ll.stage, ll.type, ll.content,
              ll.tech_stack, ll.source_url, ll.prompt_text, ll.code_snippet, ll.created_at
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
  const createdAt = nowKstIso()
  const content = assertValidUtf8Text(input.content, 'Lab 내용')
  const promptText = input.promptText?.trim()
    ? assertValidUtf8Text(input.promptText, '프롬프트')
    : null
  const sourceUrl = input.sourceUrl
    ? parseLabSourceUrl(input.sourceUrl)
    : null
  const techStackJson = serializeTechStack(input.techStack ?? [])

  await db
    .prepare(
      `INSERT INTO lab_logs (id, lab_id, step_number, stage, type, content, tech_stack, source_url, prompt_text, code_snippet, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
    )
    .bind(
      id,
      labId,
      stepNumber,
      input.stage,
      input.stage, // legacy `type` column — mirrors stage id
      content,
      techStackJson,
      sourceUrl,
      promptText,
      createdAt,
    )
    .run()

  await syncSparkStageFromLab(sparkId, input.stage)

  const fuelSettings = await getFuelSettings()
  const labFuel = fuelSettings.fuelLabCreate
  if (labFuel > 0) {
    await addUserFuel(doerId, labFuel, {
      kind: 'earn_lab',
      refType: 'lab_log',
      refId: id,
    })
  }

  const row = await db
    .prepare(
      `SELECT ll.id, ll.lab_id, l.doer_id, ll.step_number, ll.stage, ll.type, ll.content,
              ll.tech_stack, ll.source_url, ll.prompt_text, ll.code_snippet, ll.created_at
       FROM lab_logs ll
       INNER JOIN labs l ON l.id = ll.lab_id
       WHERE ll.id = ?`,
    )
    .bind(id)
    .first<LabLogRow>()

  if (!row) throw new Error('Lab log 생성 후 조회에 실패했습니다.')
  return mapLogRow(row)
}
