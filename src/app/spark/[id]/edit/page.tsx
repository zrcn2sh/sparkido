import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { SparkEditForm } from '@/components/spark/SparkEditForm'
import { SparkPageShell } from '@/components/spark/SparkPageShell'
import { Button } from '@/components/ui/button'
import { canEditSpark } from '@/lib/spark-permissions'
import { sparkHasOtherContributorLabs } from '@/lib/labs'
import { getSparkById } from '@/lib/sparks'
import { resolveSparkPath } from '@/lib/routes'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

type SparkEditPageProps = {
  params: { id: string }
}

export default async function SparkEditPage({ params }: SparkEditPageProps) {
  const host = headers().get('host') ?? ''
  const { userId } = await auth()

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/spark/${params.id}/edit`)}`)
  }

  const spark = await getSparkById(params.id)
  if (!spark) notFound()

  if (!(await canEditSpark(userId, spark))) {
    redirect(resolveSparkPath(`/${params.id}`, host))
  }

  const otherContributorLabs = await sparkHasOtherContributorLabs(
    spark.id,
    spark.authorId,
  )
  const detailPath = resolveSparkPath(`/${spark.id}`, host)

  return (
    <SparkPageShell width="md">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 h-8 text-muted-foreground"
        render={<Link href={detailPath} />}
      >
        ← Spark 상세
      </Button>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-bold">Spark 수정</h1>
        <p className="text-sm text-muted-foreground">
          제목·기타·참여 방식·공개 설정만 변경할 수 있습니다.
        </p>
      </div>
      <SparkEditForm
        spark={spark}
        otherContributorLabs={otherContributorLabs}
        detailPath={detailPath}
      />
    </SparkPageShell>
  )
}
