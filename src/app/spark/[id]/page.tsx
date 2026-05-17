import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LabFormGate } from '@/components/lab/LabFormGate'
import { LabTimeline } from '@/components/lab/LabTimeline'
import { SparkDetail } from '@/components/spark/SparkDetail'
import { SparkDetailLayout } from '@/components/spark/SparkDetailLayout'
import { Button } from '@/components/ui/button'
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
  const canWriteLab =
    !!userId && (spark.mode === 'open' || spark.authorId === userId)

  return (
    <SparkDetailLayout spark={spark} logs={logs}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 h-8 text-muted-foreground"
        render={<Link href={resolveSparkPath('/', host)} />}
      >
        ← Spark 목록
      </Button>
      <SparkDetail spark={spark} />
      <LabTimeline logs={logs} />
      <LabFormGate
        sparkId={spark.id}
        canWrite={canWriteLab}
        isSignedIn={!!userId}
      />
    </SparkDetailLayout>
  )
}
