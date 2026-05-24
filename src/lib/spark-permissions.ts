import {

  PRIVATE_SPARK_LIST_SNIPPET,

  PRIVATE_SPARK_OTHER_LABS_MESSAGE,

} from '@/lib/constants'

import { parseSparkContent } from '@/lib/spark-content'

import { sparkHasOtherContributorLabs } from '@/lib/labs'

import { isAdmin } from '@/lib/user-role'

import type { Spark, SparkMode, SparkVisibility } from '@/types'



export { PRIVATE_SPARK_LIST_SNIPPET, PRIVATE_SPARK_OTHER_LABS_MESSAGE }



export function isSparkAuthor(

  userId: string | null | undefined,

  spark: Pick<Spark, 'authorId'>,

): boolean {

  return !!userId && spark.authorId === userId

}



type SparkPermissionOptions = {

  viewerIsAdmin?: boolean

}



export function canViewSparkBody(

  userId: string | null | undefined,

  spark: Pick<Spark, 'authorId' | 'visibility'>,

  options?: SparkPermissionOptions,

): boolean {

  if (spark.visibility === 'public') return true

  if (options?.viewerIsAdmin) return true

  return isSparkAuthor(userId, spark)

}



/** 비공개여도 URL로 페이지·Lab 타임라인 접근 가능 (본문만 제한) */

export function canAccessSparkPage(

  spark: Pick<Spark, 'visibility'> | null | undefined,

): boolean {

  return !!spark

}



/** Idea Route 등 — 제목은 비공개여도 노출 */

export function getSparkRouteLabel(

  _userId: string | null | undefined,

  spark: Pick<Spark, 'title'>,

): string {

  return spark.title

}



function emptySparkContentForViewer(): string {

  return JSON.stringify({ problem: '', audience: '', solution: '' })

}



/** API·클라이언트 전달 시 본문(content)만 제거, 제목은 유지 */

export function sanitizeSparkForViewer(

  spark: Spark,

  userId: string | null | undefined,

  options?: SparkPermissionOptions,

): Spark {

  if (canViewSparkBody(userId, spark, options)) return spark

  return {

    ...spark,

    content: emptySparkContentForViewer(),

  }

}



/** 목록 카드용 한 줄 요약 */

export function getSparkListSnippet(

  userId: string | null | undefined,

  spark: Spark,

  options?: SparkPermissionOptions,

): string {

  if (!canViewSparkBody(userId, spark, options)) {

    return PRIVATE_SPARK_LIST_SNIPPET

  }

  const { problem } = parseSparkContent(spark.content)

  return problem

}



/** 작성자 또는 관리자 */

export async function canEditSpark(

  userId: string | null | undefined,

  spark: Pick<Spark, 'authorId'>,

): Promise<boolean> {

  if (!userId) return false

  if (isSparkAuthor(userId, spark)) return true

  return isAdmin(userId)

}



/** 관리자만 */

export async function canDeleteSpark(

  userId: string | null | undefined,

): Promise<boolean> {

  if (!userId) return false

  return isAdmin(userId)

}



export async function canSetSparkMode(

  spark: Pick<Spark, 'id' | 'authorId' | 'mode'>,

  nextMode: SparkMode,

  editorId: string,

): Promise<{ ok: true } | { ok: false; error: string }> {

  if (nextMode === spark.mode) return { ok: true }



  if (await isAdmin(editorId)) {

    return { ok: true }

  }



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



export async function canSetSparkVisibility(

  userId: string | null | undefined,

  spark: Pick<Spark, 'authorId'>,

  next: SparkVisibility,

): Promise<boolean> {

  if (!(await canEditSpark(userId, spark))) return false

  return next === 'public' || next === 'private'

}


