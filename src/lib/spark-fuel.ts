import { createId } from '@/lib/id'
import { nowKstIso } from '@/lib/datetime'
import { getDb } from '@/lib/db'
import { getFuelSettings } from '@/lib/fuel-settings'
import { getSparkById } from '@/lib/sparks'
import { addUserFuel } from '@/lib/user-fuel'
import {
  cheerSparkDailyLimitMessage,
  type CheerSparkErrorCode,
} from '@/lib/spark-cheer-shared'

export { cheerSparkDailyLimitMessage, type CheerSparkErrorCode }

export async function addSparkFuel(
  sparkId: string,
  amount: number,
): Promise<number> {
  if (amount <= 0) {
    const spark = await getSparkById(sparkId)
    return spark?.fuel ?? 0
  }

  const db = await getDb()
  await db
    .prepare(
      `UPDATE sparks SET fuel = fuel + ?, updated_at = ? WHERE id = ?`,
    )
    .bind(amount, nowKstIso(), sparkId)
    .run()

  const row = await db
    .prepare(`SELECT fuel FROM sparks WHERE id = ?`)
    .bind(sparkId)
    .first<{ fuel: number }>()

  return row?.fuel ?? 0
}

function todayKstDatePrefix(): string {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value
  return `${y}-${m}-${d}`
}

async function countCheersToday(
  userId: string,
  sparkId?: string,
): Promise<number> {
  const db = await getDb()
  const dayPrefix = `${todayKstDatePrefix()}%`

  if (sparkId) {
    const row = await db
      .prepare(
        `SELECT COUNT(*) AS cnt FROM fuels
         WHERE user_id = ? AND target_id = ? AND target_type = 'spark'
           AND energy_type = '응원하기' AND created_at LIKE ?`,
      )
      .bind(userId, sparkId, dayPrefix)
      .first<{ cnt: number }>()
    return row?.cnt ?? 0
  }

  const row = await db
    .prepare(
      `SELECT COUNT(*) AS cnt FROM fuels
       WHERE user_id = ? AND energy_type = '응원하기' AND created_at LIKE ?`,
    )
    .bind(userId, dayPrefix)
    .first<{ cnt: number }>()

  return row?.cnt ?? 0
}

export async function countSparkCheers(sparkId: string): Promise<number> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS cnt FROM fuels
       WHERE target_id = ? AND target_type = 'spark' AND energy_type = '응원하기'`,
    )
    .bind(sparkId)
    .first<{ cnt: number }>()
  return row?.cnt ?? 0
}

export type CheerSparkResult =
  | { ok: true; cheerCount: number; userFuelAdded: number }
  | {
      ok: false
      error: string
      code?: CheerSparkErrorCode
      limit?: number
    }

export async function cheerSpark(
  sparkId: string,
  userId: string,
): Promise<CheerSparkResult> {
  const spark = await getSparkById(sparkId)
  if (!spark) {
    return { ok: false, error: 'Spark를 찾을 수 없습니다.' }
  }

  const settings = await getFuelSettings()
  const perSpark = await countCheersToday(userId, sparkId)
  if (perSpark >= settings.maxCheerPerUserPerSparkDay) {
    const limit = settings.maxCheerPerUserPerSparkDay
    return {
      ok: false,
      error: cheerSparkDailyLimitMessage(limit),
      code: 'spark_daily_cheer_limit',
      limit,
    }
  }

  const perUser = await countCheersToday(userId)
  if (perUser >= settings.maxCheerPerUserDay) {
    return {
      ok: false,
      error: '오늘 응원 한도를 모두 사용했습니다.',
    }
  }

  const db = await getDb()
  const now = nowKstIso()
  await db
    .prepare(
      `INSERT INTO fuels (id, target_id, target_type, user_id, energy_type, created_at)
       VALUES (?, ?, 'spark', ?, '응원하기', ?)`,
    )
    .bind(createId(), sparkId, userId, now)
    .run()

  const userFuelAdded = settings.fuelOnCheer
  if (userFuelAdded > 0) {
    await addUserFuel(userId, userFuelAdded, {
      kind: 'earn_cheer',
      refType: 'spark',
      refId: sparkId,
    })
  }
  const cheerCount = await countSparkCheers(sparkId)
  return { ok: true, cheerCount, userFuelAdded }
}
