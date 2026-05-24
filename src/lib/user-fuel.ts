import {
  applyFuelChange,
  type ApplyFuelChangeResult,
  type FuelLedgerContext,
} from '@/lib/fuel-ledger'

export type { FuelLedgerContext, ApplyFuelChangeResult } from '@/lib/fuel-ledger'
export { listFuelLedgerForUser, getFuelLedgerEntry } from '@/lib/fuel-ledger'

export type UserFuelBalance = {
  available: number
  total: number
}

const EMPTY_BALANCE: UserFuelBalance = { available: 0, total: 0 }

export async function getUserFuelBalance(
  clerkUserId: string,
): Promise<UserFuelBalance> {
  const { getDb } = await import('@/lib/db')
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT fuel_available, fuel_total FROM user_fuel WHERE clerk_user_id = ?`,
    )
    .bind(clerkUserId)
    .first<{ fuel_available: number; fuel_total: number }>()

  return row
    ? { available: row.fuel_available, total: row.fuel_total }
    : EMPTY_BALANCE
}

/** 획득 — available·total 모두 증가 + 원장 */
export async function addUserFuel(
  clerkUserId: string,
  amount: number,
  ctx: FuelLedgerContext,
): Promise<ApplyFuelChangeResult> {
  const n = Math.floor(amount)
  if (n <= 0) {
    const balance = await getUserFuelBalance(clerkUserId)
    return { balance, ledgerId: '' }
  }
  return applyFuelChange(clerkUserId, n, n, ctx)
}

/** 사용 — available만 차감 + 원장 */
export async function spendUserFuel(
  clerkUserId: string,
  amount: number,
  ctx: FuelLedgerContext,
): Promise<ApplyFuelChangeResult> {
  const n = Math.floor(amount)
  if (n <= 0) {
    const balance = await getUserFuelBalance(clerkUserId)
    return { balance, ledgerId: '' }
  }
  return applyFuelChange(clerkUserId, -n, 0, ctx)
}

/** 환불 — available만 복구 + 원장 (total 불변) */
export async function refundUserFuel(
  clerkUserId: string,
  amount: number,
  ctx: FuelLedgerContext,
): Promise<ApplyFuelChangeResult> {
  const n = Math.floor(amount)
  if (n <= 0) {
    const balance = await getUserFuelBalance(clerkUserId)
    return { balance, ledgerId: '' }
  }
  return applyFuelChange(clerkUserId, n, 0, ctx)
}
