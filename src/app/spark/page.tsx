export const runtime = 'edge'

import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { SparkCard } from '@/components/spark/SparkCard'
import { SparkPageShell } from '@/components/spark/SparkPageShell'
import { Button } from '@/components/ui/button'
import { getDisplayNamesByUserIds } from '@/lib/auth'
import { countLabParticipantsBySparkIds } from '@/lib/labs'
import { listSparks } from '@/lib/sparks'
import { isAdmin } from '@/lib/user-role'
import { resolveSparkPath } from '@/lib/routes'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function SparkListPage() {
  const host = headers().get('host') ?? ''
  let sparks: Awaited<ReturnType<typeof listSparks>> = []
  let loadError: string | null = null

  const { userId } = await auth()
  const viewerIsAdmin = userId ? await isAdmin(userId) : false

  let authorNames: Record<string, string> = {}

  let participantCounts: Record<string, number> = {}

  try {
    sparks = await listSparks()
    const authorIds = Array.from(new Set(sparks.map((s) => s.authorId)))
    const [names, counts] = await Promise.all([
      getDisplayNamesByUserIds(authorIds),
      countLabParticipantsBySparkIds(sparks.map((s) => s.id)),
    ])
    authorNames = names
    participantCounts = counts
  } catch (error) {
    console.error('[SparkListPage]', error)
    loadError =
      'Spark 목록을 불러오지 못했습니다. D1 로컬 DB가 준비되었는지 확인하세요. (npm run db:migrate:local)'
  }

  return (
    <SparkPageShell width="xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>Spark</h1>
          <p className="mt-2 text-muted-foreground">
            아이디어를 등록하고 실행의 궤적을 남기세요.
          </p>
        </div>
        <Button
          size="sm"
          className="shrink-0"
          render={<Link href={resolveSparkPath('/new', host)} />}
        >
          Spark 등록
        </Button>
      </header>

      {loadError && (
        <p className="mt-8 rounded-lg border-hairline border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {!loadError && sparks.length === 0 && (
        <div className="mt-12 rounded-lg border-hairline border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            등록된 Spark가 없습니다. 첫 Spark를 등록해 보세요.
          </p>
          <Button
            className="mt-6"
            size="sm"
            render={<Link href={resolveSparkPath('/new', host)} />}
          >
            Spark 등록하기
          </Button>
        </div>
      )}

      {!loadError && sparks.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          {sparks.map((spark) => (
            <li key={spark.id} className="h-full">
              <SparkCard
                spark={spark}
                viewerId={userId}
                viewerIsAdmin={viewerIsAdmin}
                authorName={authorNames[spark.authorId] ?? '알 수 없음'}
                participantCount={participantCounts[spark.id] ?? 0}
              />
            </li>
          ))}
        </ul>
      )}
    </SparkPageShell>
  )
}
