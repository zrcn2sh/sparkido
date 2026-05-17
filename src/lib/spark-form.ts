import { isSparkMode } from '@/lib/api'
import type { CreateSparkInput } from '@/lib/sparks'
import type { SparkMode, SparkVisibility } from '@/types'

export const SPARK_FIELD_LIMITS = {
  title: 60,
  problem: 500,
  audience: 200,
  solution: 500,
  notes: 2000,
} as const

/** Spark 등록 입력 placeholder (문장 형식 통일) */
export const SPARK_FORM_PLACEHOLDERS = {
  title: '한 줄로 표현해 주세요',
  problem: '불편함을 구체적으로 적어 주세요',
  audience: '타깃을 구체적으로 적어 주세요',
  solution: '해결 방향을 적어 주세요',
  notes: '추가로 전하고 싶은 내용을 적어 주세요',
} as const

/** @deprecated SparkFormField는 guide prop 사용 */
export type SparkFormHintRow = {
  text: string
  example?: string
}

export type SparkFormFieldGuide = {
  /** 작성 가이드 제목 옆·같은 줄에 표시 */
  description: string
  /** 가이드 블록 하단 한 줄 예시 */
  example?: string
}

export type ValidatedCreateSparkInput = CreateSparkInput & {
  title: string
  notes?: string
}

function limitText(value: string, max: number): string {
  return value.trim().slice(0, max)
}

export function validateCreateSparkInput(
  body: Partial<CreateSparkInput & { notes?: string }>,
): { ok: true; data: ValidatedCreateSparkInput } | { ok: false; error: string } {
  const title = limitText(body.title ?? '', SPARK_FIELD_LIMITS.title)
  if (!title) {
    return { ok: false, error: 'Spark 제목을 입력해 주세요.' }
  }

  const problem = limitText(body.problem ?? '', SPARK_FIELD_LIMITS.problem)
  if (!problem) {
    return { ok: false, error: '어떤 불편함을 해결하고 싶은지 입력해 주세요.' }
  }

  const audience = limitText(body.audience ?? '', SPARK_FIELD_LIMITS.audience)
  if (!audience) {
    return { ok: false, error: '누가 이 문제를 겪는지 입력해 주세요.' }
  }

  const solution = limitText(body.solution ?? '', SPARK_FIELD_LIMITS.solution)
  if (!solution) {
    return { ok: false, error: '어떻게 풀 생각인지 입력해 주세요.' }
  }

  if (!body.mode || !isSparkMode(body.mode)) {
    return { ok: false, error: '참여 방식(solo/open)을 선택해 주세요.' }
  }

  const notesRaw = body.notes?.trim()
  const notes = notesRaw
    ? limitText(notesRaw, SPARK_FIELD_LIMITS.notes)
    : undefined

  return {
    ok: true,
    data: {
      title,
      problem,
      audience,
      solution,
      notes,
      mode: body.mode as SparkMode,
    },
  }
}

export type UpdateSparkInput = {
  title?: string
  notes?: string
  mode?: SparkMode
  visibility?: SparkVisibility
}

export type ValidatedUpdateSparkInput = {
  title?: string
  notes?: string
  mode?: SparkMode
  visibility?: SparkVisibility
}

export function validateUpdateSparkInput(
  body: Partial<UpdateSparkInput>,
): { ok: true; data: ValidatedUpdateSparkInput } | { ok: false; error: string } {
  const data: ValidatedUpdateSparkInput = {}

  if (body.title !== undefined) {
    const title = limitText(body.title, SPARK_FIELD_LIMITS.title)
    if (!title) {
      return { ok: false, error: 'Spark 제목을 입력해 주세요.' }
    }
    data.title = title
  }

  if (body.notes !== undefined) {
    const trimmed = body.notes.trim()
    data.notes = trimmed
      ? limitText(trimmed, SPARK_FIELD_LIMITS.notes)
      : ''
  }

  if (body.mode !== undefined) {
    if (!isSparkMode(body.mode)) {
      return { ok: false, error: '참여 방식(solo/open)이 올바르지 않습니다.' }
    }
    data.mode = body.mode
  }

  if (body.visibility !== undefined) {
    if (body.visibility !== 'public' && body.visibility !== 'private') {
      return { ok: false, error: '공개 설정이 올바르지 않습니다.' }
    }
    data.visibility = body.visibility
  }

  if (
    data.title === undefined &&
    data.notes === undefined &&
    data.mode === undefined &&
    data.visibility === undefined
  ) {
    return { ok: false, error: '수정할 항목이 없습니다.' }
  }

  return { ok: true, data }
}
