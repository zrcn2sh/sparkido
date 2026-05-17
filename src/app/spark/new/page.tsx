import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { SparkForm } from '@/components/spark/SparkForm'
import { SparkPageShell } from '@/components/spark/SparkPageShell'
import { resolveSparkPath } from '@/lib/routes'

export default async function SparkNewPage() {
  const { userId } = await auth()
  if (!userId) {
    const host = headers().get('host') ?? ''
    const returnUrl = resolveSparkPath('/new', host)
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`,
    )
  }

  return (
    <SparkPageShell width="md" className="py-12">
      <h1 className="text-2xl font-bold">Spark 등록</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        아이디어를 등록하고 실행의 궤적을 남겨 보세요.
      </p>
      <SparkForm />
    </SparkPageShell>
  )
}
