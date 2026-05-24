import type { SparkMode } from '@/types'

export const SPARK_MODE_LABELS: Record<SparkMode, string> = {
  solo: 'Solo Do',
  open: 'Open Do',
}

export const PRIVATE_SPARK_OTHER_LABS_MESSAGE =
  '이 Spark에 다른 참여자의 기록이 있습니다'

/** 목록·카드에서 비작성자에게 보여 줄 요약 (본문 미노출) */
export const PRIVATE_SPARK_LIST_SNIPPET =
  '본문은 비공개입니다. Lab 기록은 상세에서 확인할 수 있습니다.'
