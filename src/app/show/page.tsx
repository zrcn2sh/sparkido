import { ShowMain } from '@/components/show/ShowMain'
import { SparkPageShell } from '@/components/spark/SparkPageShell'
import { listShowPages } from '@/lib/show-tiles'
import { auth } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function ShowPage() {
  const host = headers().get('host') ?? ''
  const { userId } = await auth()
  let pages: Awaited<ReturnType<typeof listShowPages>> = []
  let loadError: string | null = null

  try {
    pages = await listShowPages(userId)
  } catch (error) {
    console.error('[ShowPage]', error)
    loadError =
      'Show를 불러오지 못했습니다. D1 마이그레이션을 적용했는지 확인하세요. (npm run db:migrate:local)'
  }

  return (
    <main className="flex-1">
      <SparkPageShell width="xl" className="py-6 sm:py-8 lg:py-10">
        <ShowMain pages={pages} host={host} loadError={loadError} />
      </SparkPageShell>
    </main>
  )
}
