import { nowKstIso } from '@/lib/datetime'
import { getDb } from '@/lib/db'
import { createId } from '@/lib/id'
import type { UserFuelBalance } from '@/lib/user-fuel'

/** 원장 kind — 환불·Show 연동 시 확장 */
export type FuelLedgerKind =
  | 'earn_spark'
  | 'earn_lab'
  | 'earn_cheer'
  | 'earn_login'
  | 'earn_signup'
  | 'spend_show_tile'
  | 'refund_show_unused'
  | 'refund_show_removed'
  | 'refund_show_register_failed'
  | 'adjust_admin'

export type FuelLedgerContext = {
  kind: FuelLedgerKind
  refType?: string | null
  refId?: string | null
  /** 환불 시 원 spend 레코드 id */
  relatedLedgerId?: string | null
  meta?: Record<string, unknown>
}

export type FuelLedgerEntry = {
  id: string
  clerkUserId: string
  kind: FuelLedgerKind
  deltaAvailable: number
  deltaTotal: number
  availableAfter: number
  totalAfter: number
  refType: string | null
  refId: string | null
  relatedLedgerId: string | null
  meta: Record<string, unknown> | null
  createdAt: string
}

type FuelLedgerRow = {
  id: string
  clerk_user_id: string
  kind: string
  delta_available: number
  delta_total: number
  available_after: number
  total_after: number
  ref_type: string | null
  ref_id: string | null
  related_ledger_id: string | null
  meta_json: string | null
  created_at: string
}

function mapRow(row: FuelLedgerRow): FuelLedgerEntry {
  let meta: Record<string, unknown> | null = null
  if (row.meta_json) {
    try {
      meta = JSON.parse(row.meta_json) as Record<string, unknown>
    } catch {
      meta = null
    }
  }
  return {
    id: row.id,
    clerkUserId: row.clerk_user_id,
    kind: row.kind as FuelLedgerKind,
    deltaAvailable: row.delta_available,
    deltaTotal: row.delta_total,
    availableAfter: row.available_after,
    totalAfter: row.total_after,
    refType: row.ref_type,
    refId: row.ref_id,
    relatedLedgerId: row.related_ledger_id,
    meta,
    createdAt: row.created_at,
  }
}

export type ApplyFuelChangeResult = {
  balance: UserFuelBalance
  ledgerId: string
}

/**
 * 잔액 변경 + 원장 1건 (배치).
 * - 적립: deltaAvailable > 0, deltaTotal 동일
 * - 사용: deltaAvailable < 0, deltaTotal = 0
 * - 환불: deltaAvailable > 0, deltaTotal = 0
 */
export async function applyFuelChange(
  clerkUserId: string,
  deltaAvailable: number,
  deltaTotal: number,
  ctx: FuelLedgerContext,
): Promise<ApplyFuelChangeResult> {
  const dAvail = Math.floor(deltaAvailable)
  const dTotal = Math.floor(deltaTotal)
  if (dAvail === 0 && dTotal === 0) {
    const db = await getDb()
    const row = await db
      .prepare(
        `SELECT fuel_available, fuel_total FROM user_fuel WHERE clerk_user_id = ?`,
      )
      .bind(clerkUserId)
      .first<{ fuel_available: number; fuel_total: number }>()
    const balance: UserFuelBalance = row
      ? { available: row.fuel_available, total: row.fuel_total }
      : { available: 0, total: 0 }
    return { balance, ledgerId: '' }
  }

  const db = await getDb()
  const now = nowKstIso()
  const ledgerId = createId()

  const current = await db
    .prepare(
      `SELECT fuel_available, fuel_total FROM user_fuel WHERE clerk_user_id = ?`,
    )
    .bind(clerkUserId)
    .first<{ fuel_available: number; fuel_total: number }>()

  const availBefore = current?.fuel_available ?? 0
  const totalBefore = current?.fuel_total ?? 0
  const availAfter = availBefore + dAvail
  const totalAfter = totalBefore + dTotal

  if (availAfter < 0) {
    throw new Error(
      `Fuel이 부족합니다. (필요 ${-dAvail}, 보유 ${availBefore})`,
    )
  }
  if (totalAfter < 0) {
    throw new Error('Fuel 누적 잔액이 올바르지 않습니다.')
  }

  const metaJson = ctx.meta ? JSON.stringify(ctx.meta) : null

  const upsertFuel =
    current == null
      ? db
          .prepare(
            `INSERT INTO user_fuel (clerk_user_id, fuel_available, fuel_total, updated_at)
             VALUES (?, ?, ?, ?)`,
          )
          .bind(clerkUserId, availAfter, totalAfter, now)
      : db
          .prepare(
            `UPDATE user_fuel SET fuel_available = ?, fuel_total = ?, updated_at = ?
             WHERE clerk_user_id = ?`,
          )
          .bind(availAfter, totalAfter, now, clerkUserId)

  const insertLedger = db
    .prepare(
      `INSERT INTO fuel_ledger (
         id, clerk_user_id, kind, delta_available, delta_total,
         available_after, total_after, ref_type, ref_id, related_ledger_id,
         meta_json, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      ledgerId,
      clerkUserId,
      ctx.kind,
      dAvail,
      dTotal,
      availAfter,
      totalAfter,
      ctx.refType ?? null,
      ctx.refId ?? null,
      ctx.relatedLedgerId ?? null,
      metaJson,
      now,
    )

  await db.batch([upsertFuel, insertLedger])

  return {
    balance: { available: availAfter, total: totalAfter },
    ledgerId,
  }
}

export async function listFuelLedgerForUser(
  clerkUserId: string,
  limit = 50,
): Promise<FuelLedgerEntry[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT id, clerk_user_id, kind, delta_available, delta_total,
              available_after, total_after, ref_type, ref_id, related_ledger_id,
              meta_json, created_at
       FROM fuel_ledger
       WHERE clerk_user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(clerkUserId, limit)
    .all<FuelLedgerRow>()

  return (results ?? []).map(mapRow)
}

/** Show 타일 spend 원장 (환불 시 related_ledger_id 로 연결) */
export async function getFuelLedgerEntry(
  ledgerId: string,
): Promise<FuelLedgerEntry | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT id, clerk_user_id, kind, delta_available, delta_total,
              available_after, total_after, ref_type, ref_id, related_ledger_id,
              meta_json, created_at
       FROM fuel_ledger WHERE id = ?`,
    )
    .bind(ledgerId)
    .first<FuelLedgerRow>()

  return row ? mapRow(row) : null
}
