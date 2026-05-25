import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SparkForm } from '@/components/spark/SparkForm'
import { SparkPageShell } from '@/components/spark/SparkPageShell'
import { getRequestHost } from '@/lib/request-host'
import { resolveSparkPath } from '@/lib/routes'

export default async function SparkNewPage() {
  const { userId } = await auth()
  if (!userId) {
    const host = await getRequestHost()
    const returnUrl = resolveSparkPath('/new', host)
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`,
    )
  }

  return (
    <SparkPageShell width="md" className="py-12">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-bold">Spark 등록</h1>
        <p className="text-sm text-muted-foreground">
          아이디어를 등록하고 실행의 궤적을 남겨 보세요.
        </p>
      </div>
      <SparkForm />
    </SparkPageShell>
  )
}
