import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LabFormGate } from '@/components/lab/LabFormGate'
import { LabTimeline } from '@/components/lab/LabTimeline'
import { SparkDetail } from '@/components/spark/SparkDetail'
import { Button } from '@/components/ui/button'
import { listLabLogsBySparkId } from '@/lib/labs'
import { getSparkById } from '@/lib/sparks'

export const dynamic = 'force-dynamic'

type SparkDetailPageProps = {
  params: { id: string }
}

export default async function SparkDetailPage({ params }: SparkDetailPageProps) {
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
    <section className="mx-auto max-w-3xl px-6 py-10">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 h-8 text-muted-foreground"
        render={<Link href="/" />}
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
    </section>
  )
}
