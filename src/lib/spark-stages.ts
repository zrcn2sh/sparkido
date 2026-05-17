import type { SparkStage } from '@/types'

export type SparkStageMeta = {
  id: SparkStage
  label: string
  shortLabel: string
  icon: string
  badgeClass: string
  routeRing: string
}

/** 순서 없음 — Lab 등록 시 선택하는 작업 단계 */
export const SPARK_STAGES: SparkStageMeta[] = [
  {
    id: 'idea',
    label: 'Idea',
    shortLabel: '아이디어',
    icon: '💡',
    badgeClass: 'border-gray-400/30 bg-gray-50 text-gray-800',
    routeRing: 'border-gray-400 bg-gray-50',
  },
  {
    id: 'validate',
    label: 'Validate',
    shortLabel: '검증 중',
    icon: '🔍',
    badgeClass: 'border-amber-400/30 bg-amber-50 text-amber-800',
    routeRing: 'border-amber-400 bg-amber-50',
  },
  {
    id: 'build',
    label: 'Build',
    shortLabel: '개발 중',
    icon: '⛏️',
    badgeClass: 'border-blue-400/30 bg-blue-50 text-blue-800',
    routeRing: 'border-blue-400 bg-blue-50',
  },
  {
    id: 'live',
    label: 'Live',
    shortLabel: '출시·운영',
    icon: '🚀',
    badgeClass: 'border-teal-400/30 bg-teal-50 text-teal-800',
    routeRing: 'border-teal-400 bg-teal-50',
  },
]

const STAGE_IDS = new Set(SPARK_STAGES.map((s) => s.id))

const LEGACY_STAGE: Record<string, SparkStage> = {
  validating: 'validate',
  building: 'build',
  launched: 'live',
}

export function isSparkStage(value: unknown): value is SparkStage {
  return typeof value === 'string' && STAGE_IDS.has(value as SparkStage)
}

export function normalizeSparkStage(raw: string): SparkStage {
  if (isSparkStage(raw)) return raw
  return LEGACY_STAGE[raw] ?? 'idea'
}

export function getSparkStageMeta(stage: SparkStage | string): SparkStageMeta {
  const id = typeof stage === 'string' ? normalizeSparkStage(stage) : stage
  return SPARK_STAGES.find((s) => s.id === id)!
}

export const SPARK_STAGE_LABELS = Object.fromEntries(
  SPARK_STAGES.map((s) => [s.id, s.shortLabel]),
) as Record<SparkStage, string>

export const SPARK_STAGE_BADGE_CLASS = Object.fromEntries(
  SPARK_STAGES.map((s) => [s.id, s.badgeClass]),
) as Record<SparkStage, string>
