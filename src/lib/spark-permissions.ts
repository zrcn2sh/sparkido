import { PRIVATE_SPARK_OTHER_LABS_MESSAGE } from '@/lib/constants'
import { sparkHasOtherContributorLabs } from '@/lib/labs'
import type { Spark, SparkMode, SparkVisibility } from '@/types'

export { PRIVATE_SPARK_OTHER_LABS_MESSAGE }

export function isSparkAuthor(
  userId: string | null | undefined,
  spark: Pick<Spark, 'authorId'>,
): boolean {
  return !!userId && spark.authorId === userId
}

export function canViewSparkBody(
  userId: string | null | undefined,
  spark: Pick<Spark, 'authorId' | 'visibility'>,
): boolean {
  if (spark.visibility === 'public') return true
  return isSparkAuthor(userId, spark)
}

/** 비공개여도 URL로 페이지·Lab 타임라인 접근 가능 (본문만 제한) */
export function canAccessSparkPage(
  spark: Pick<Spark, 'visibility'> | null | undefined,
): boolean {
  return !!spark
}

/** Idea Route 등에서 비작성자에게 노출할 Spark 라벨 */
export function getSparkRouteLabel(
  userId: string | null | undefined,
  spark: Pick<Spark, 'title' | 'authorId' | 'visibility'>,
): string {
  return canViewSparkBody(userId, spark) ? spark.title : '비공개 Spark'
}

/** API·클라이언트 전달 시 본문(content) 제거 */
export function sanitizeSparkForViewer(
  spark: Spark,
  userId: string | null | undefined,
): Spark {
  if (canViewSparkBody(userId, spark)) return spark
  return {
    ...spark,
    title: '비공개 Spark',
    content: '',
  }
}

export function canEditSpark(
  userId: string | null | undefined,
  spark: Pick<Spark, 'authorId'>,
): boolean {
  return isSparkAuthor(userId, spark)
}

export async function canSetSparkMode(
  spark: Pick<Spark, 'id' | 'authorId' | 'mode'>,
  nextMode: SparkMode,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (nextMode === spark.mode) return { ok: true }

  if (spark.mode === 'solo' && nextMode === 'open') {
    return { ok: true }
  }

  if (spark.mode === 'open' && nextMode === 'solo') {
    const hasOthers = await sparkHasOtherContributorLabs(spark.id, spark.authorId)
    if (hasOthers) {
      return {
        ok: false,
        error:
          '다른 참여자의 Lab 기록이 있어 Open Do에서 Solo Do로 바꿀 수 없습니다.',
      }
    }
    return { ok: true }
  }

  return { ok: false, error: '참여 방식 변경이 올바르지 않습니다.' }
}

export function canSetSparkVisibility(
  userId: string | null | undefined,
  spark: Pick<Spark, 'authorId'>,
  next: SparkVisibility,
): boolean {
  if (!isSparkAuthor(userId, spark)) return false
  return next === 'public' || next === 'private'
}
