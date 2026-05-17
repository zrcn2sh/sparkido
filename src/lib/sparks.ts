import { createId } from '@/lib/id'
import { getDb } from '@/lib/db'
import type { Spark, SparkContent, SparkMode, SparkStage } from '@/types'

type SparkRow = {
  id: string
  author_id: string
  mode: SparkMode
  title: string
  content: string
  stage: SparkStage
  voltage: number
  created_at: string
  updated_at: string
}

export type CreateSparkInput = {
  problem: string
  audience: string
  solution: string
  stage: SparkStage
  mode: SparkMode
  techStack?: string[]
  title?: string
}

function mapRow(row: SparkRow): Spark {
  return {
    id: row.id,
    authorId: row.author_id,
    mode: row.mode,
    title: row.title,
    content: row.content,
    stage: row.stage,
    voltage: row.voltage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function parseSparkContent(raw: string): SparkContent {
  try {
    const parsed = JSON.parse(raw) as SparkContent
    if (parsed.problem && parsed.audience && parsed.solution) {
      return parsed
    }
  } catch {
    /* legacy plain text */
  }
  return {
    problem: raw,
    audience: '',
    solution: '',
  }
}

function buildContent(input: CreateSparkInput): string {
  const payload: SparkContent = {
    problem: input.problem.trim(),
    audience: input.audience.trim(),
    solution: input.solution.trim(),
    techStack: input.techStack?.filter(Boolean),
  }
  return JSON.stringify(payload)
}

function buildTitle(input: CreateSparkInput): string {
  if (input.title?.trim()) return input.title.trim()
  const line = input.problem.trim().split('\n')[0]
  return line.length > 80 ? `${line.slice(0, 77)}...` : line
}

export async function listSparks(): Promise<Spark[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT id, author_id, mode, title, content, stage, voltage, created_at, updated_at
       FROM sparks
       ORDER BY created_at DESC`,
    )
    .all<SparkRow>()

  return (results ?? []).map(mapRow)
}

export async function getSparkById(id: string): Promise<Spark | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT id, author_id, mode, title, content, stage, voltage, created_at, updated_at
       FROM sparks
       WHERE id = ?`,
    )
    .bind(id)
    .first<SparkRow>()

  return row ? mapRow(row) : null
}

export async function createSpark(
  input: CreateSparkInput,
  authorId: string,
): Promise<Spark> {
  const db = await getDb()
  const id = createId()
  const title = buildTitle(input)
  const content = buildContent(input)
  const now = new Date().toISOString()

  await db
    .prepare(
      `INSERT INTO sparks (id, author_id, mode, title, content, stage, voltage, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    )
    .bind(id, authorId, input.mode, title, content, input.stage, now, now)
    .run()

  return {
    id,
    authorId,
    mode: input.mode,
    title,
    content,
    stage: input.stage,
    voltage: 0,
    createdAt: now,
    updatedAt: now,
  }
}
