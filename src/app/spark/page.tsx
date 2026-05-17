import Link from 'next/link'
import { SparkCard } from '@/components/spark/SparkCard'
import { Button } from '@/components/ui/button'
import { listSparks } from '@/lib/sparks'

export const dynamic = 'force-dynamic'

export default async function SparkListPage() {
  let sparks: Awaited<ReturnType<typeof listSparks>> = []
  let loadError: string | null = null

  try {
    sparks = await listSparks()
  } catch (error) {
    console.error('[SparkListPage]', error)
    loadError =
      'Spark 목록을 불러오지 못했습니다. D1 로컬 DB가 준비되었는지 확인하세요. (npm run db:migrate:local)'
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1>Spark</h1>
          <p className="mt-2 text-muted-foreground">
            아이디어를 등록하고 실행의 궤적을 남기세요.
          </p>
        </div>
        <Button size="sm" render={<Link href="/new" />}>
          Spark 등록
        </Button>
      </div>

      {loadError && (
        <p className="mt-8 rounded-lg border-hairline border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {!loadError && sparks.length === 0 && (
        <p className="mt-12 rounded-lg border-hairline border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          등록된 Spark가 없습니다. 첫 Spark를 등록해 보세요.
        </p>
      )}

      {!loadError && sparks.length > 0 && (
        <ul className="mt-8 space-y-3">
          {sparks.map((spark) => (
            <li key={spark.id}>
              <SparkCard spark={spark} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
