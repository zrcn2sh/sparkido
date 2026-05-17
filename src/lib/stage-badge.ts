import type { SparkStage } from '@/types'

export const SPARK_STAGE_LABELS: Record<SparkStage, string> = {
  idea: '아이디어',
  validating: '검증 중',
  building: '개발 중',
  launched: '출시',
}

export const SPARK_STAGE_BADGE_CLASS: Record<SparkStage, string> = {
  idea: 'border-gray-400/30 bg-gray-50 text-gray-800',
  validating: 'border-amber-400/30 bg-amber-50 text-amber-800',
  building: 'border-blue-400/30 bg-blue-50 text-blue-800',
  launched: 'border-teal-400/30 bg-teal-50 text-teal-800',
}
