import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LabFormGate } from '@/components/lab/LabFormGate'
import { SparkDetail } from '@/components/spark/SparkDetail'
import { SparkDetailLayout } from '@/components/spark/SparkDetailLayout'
import { SparkPrivateNotice } from '@/components/spark/SparkPrivateNotice'
import { Button } from '@/components/ui/button'
import { getDisplayNamesByUserIds, getUserDisplayName } from '@/lib/auth'
import { SparkDeleteButton } from '@/components/spark/SparkDeleteButton'
import {
  canDeleteSpark,
  canEditSpark,
  canViewSparkBody,
} from '@/lib/spark-permissions'
import { isAdmin } from '@/lib/user-role'
import { listLabLogsBySparkId } from '@/lib/labs'
import { getFuelSettings } from '@/lib/fuel-settings'
import { countSparkCheers } from '@/lib/spark-fuel'
import { getSparkById } from '@/lib/sparks'
import { getRequestHost } from '@/lib/request-host'
import { resolveSparkPath } from '@/lib/routes'

export const dynamic = 'force-dynamic'

type SparkDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function SparkDetailPage(props: SparkDetailPageProps) {
  const params = await props.params;
  const host = await getRequestHost()
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
  const viewerIsAdmin = userId ? await isAdmin(userId) : false
  const authorName = await getUserDisplayName(spark.authorId)
  const showBody = canViewSparkBody(userId, spark, { viewerIsAdmin })
  const canEdit = userId ? await canEditSpark(userId, spark) : false
  const canDelete = userId ? await canDeleteSpark(userId) : false
  const canWriteLab =
    !!userId && (spark.mode === 'open' || spark.authorId === userId)
  const editPath = resolveSparkPath(`/${spark.id}/edit`, host)
  const listPath = resolveSparkPath('/', host)

  const doerIds = Array.from(
    new Set([spark.authorId, ...logs.map((log) => log.doerId)]),
  )
  const [doerNames, fuelSettings, cheerCount] = await Promise.all([
    getDisplayNamesByUserIds(doerIds),
    getFuelSettings(),
    countSparkCheers(spark.id),
  ])

  return (
    <SparkDetailLayout
      spark={spark}
      logs={logs}
      doerNames={doerNames}
      cheerCount={cheerCount}
      maxCheerPerUserPerSparkDay={fuelSettings.maxCheerPerUserPerSparkDay}
      isSignedIn={!!userId}
      sparkBodyHidden={!showBody}
      labForm={
        <LabFormGate
          sparkId={spark.id}
          canWrite={canWriteLab}
          isSignedIn={!!userId}
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 text-muted-foreground"
          render={<Link href={resolveSparkPath('/', host)} />}
        >
          ← Spark 목록
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button size="sm" variant="outline" render={<Link href={editPath} />}>
              Spark 수정
            </Button>
          )}
          {canDelete && (
            <SparkDeleteButton sparkId={spark.id} listPath={listPath} />
          )}
        </div>
      </div>
      {showBody ? (
        <SparkDetail spark={spark} authorName={authorName} />
      ) : (
        <SparkPrivateNotice title={spark.title} />
      )}
    </SparkDetailLayout>
  )
}
