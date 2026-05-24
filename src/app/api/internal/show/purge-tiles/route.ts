import { getKstYmd, nowKstIso } from '@/lib/datetime'
import { getDb } from '@/lib/db'
import { purgeAllShowTiles } from '@/lib/show-tiles'
import { NextResponse } from 'next/server'

const DEV_PURGE_SECRET = 'dev-local-show-purge'

export const runtime = 'nodejs'

/** 매월 1일 0시(KST) Cron — Show 타일 전체 삭제 */
export async function POST(req: Request) {
  const secret = req.headers.get('x-sparkido-cron-secret')
  const expected =
    process.env.SHOW_CRON_PURGE_SECRET?.trim() || DEV_PURGE_SECRET
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { year, month } = getKstYmd()
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`

  try {
    const db = await getDb()
    const existing = await db
      .prepare(
        `SELECT year_month FROM show_monthly_purges WHERE year_month = ?`,
      )
      .bind(yearMonth)
      .first<{ year_month: string }>()

    if (existing) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        yearMonth,
        removed: 0,
      })
    }

    const removed = await purgeAllShowTiles({
      actorType: 'cron',
      meta: { yearMonth, source: 'monthly_cron' },
    })
    const now = nowKstIso()
    await db
      .prepare(
        `INSERT INTO show_monthly_purges (year_month, purged_at, tiles_removed)
         VALUES (?, ?, ?)`,
      )
      .bind(yearMonth, now, removed)
      .run()

    return NextResponse.json({ ok: true, yearMonth, removed })
  } catch (error) {
    console.error('[POST /api/internal/show/purge-tiles]', error)
    return NextResponse.json(
      { error: 'Show 타일 월간 삭제에 실패했습니다.' },
      { status: 500 },
    )
  }
}
