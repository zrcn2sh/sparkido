import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LabFormGate } from '@/components/lab/LabFormGate'
import { LabTimeline } from '@/components/lab/LabTimeline'
import { SparkDetail } from '@/components/spark/SparkDetail'
import { SparkDetailLayout } from '@/components/spark/SparkDetailLayout'
import { SparkPrivateNotice } from '@/components/spark/SparkPrivateNotice'
import { Button } from '@/components/ui/button'
import { getUserDisplayName } from '@/lib/auth'
import {
  canEditSpark,
  canViewSparkBody,
  getSparkRouteLabel,
} from '@/lib/spark-permissions'
import { listLabLogsBySparkId } from '@/lib/labs'
import { getSparkById } from '@/lib/sparks'
import { resolveSparkPath } from '@/lib/routes'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

type SparkDetailPageProps = {
  params: { id: string }
}

export default async function SparkDetailPage({ params }: SparkDetailPageProps) {
  const host = headers().get('host') ?? ''
  let spark: Awaited<ReturnType<typeof getSparkById>> = null
  let logs: Awaited<ReturnType<typeof listLabLogsBySparkId>> = []

  try {
    spark = await getSparkById(params.id)
    if (spark) {
      logs = await listLabLogsBySparkId(params.id)
    }
  } catch (error) {
    console.error('[SparkDetailPage]', error)
    throw error
  }

  if (!spark) notFound()

  const { userId } = await auth()
  const authorName = await getUserDisplayName(spark.authorId)
  const showBody = canViewSparkBody(userId, spark)
  const sparkRouteLabel = getSparkRouteLabel(userId, spark)
  const isOwner = canEditSpark(userId, spark)
  const canWriteLab =
    !!userId && (spark.mode === 'open' || spark.authorId === userId)
  const editPath = resolveSparkPath(`/${spark.id}/edit`, host)

  return (
    <SparkDetailLayout spark={spark} sparkRouteLabel={sparkRouteLabel} logs={logs}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 text-muted-foreground"
          render={<Link href={resolveSparkPath('/', host)} />}
        >
          ← Spark 목록
        </Button>
        {isOwner && (
          <Button size="sm" variant="outline" render={<Link href={editPath} />}>
            Spark 수정
          </Button>
        )}
      </div>
      {showBody ? (
        <SparkDetail spark={spark} authorName={authorName} />
      ) : (
        <SparkPrivateNotice />
      )}
      {/* 비공개 Spark도 Lab 기록은 참여자·방문자 모두 열람 가능 */}
      <LabTimeline logs={logs} sparkBodyHidden={!showBody} />
      <LabFormGate
        sparkId={spark.id}
        canWrite={canWriteLab}
        isSignedIn={!!userId}
      />
    </SparkDetailLayout>
  )
}
