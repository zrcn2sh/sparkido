import { clerkClient } from '@clerk/nextjs/server'
import { todayKstDateString } from '@/lib/admin-fuel-ledger'
import { getKstYmd, msToKstIso, nowKstIso, parseStoredDate } from '@/lib/datetime'
import { getDb } from '@/lib/db'
import { getFuelSettings } from '@/lib/fuel-settings'
import { addUserFuel } from '@/lib/user-fuel'

/** Fuel 토스트 — 적립 직후 표시 허용 시간 */
export const LOGIN_FUEL_TOAST_MAX_AGE_MS = 20 * 60 * 1000
export const SIGNUP_FUEL_TOAST_MAX_AGE_MS = 60 * 60 * 1000

export type PendingFuelToast = {
  show: boolean
  amount: number
  ledgerId: string | null
}

function kstDateStringFromIso(iso: string): string {
  const { year, month, day } = getKstYmd(parseStoredDate(iso))
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

async function hasFuelLedgerKind(
  clerkUserId: string,
  kind: 'earn_signup' | 'earn_login',
  refType?: string,
  refId?: string,
): Promise<boolean> {
  const db = await getDb()
  if (refType && refId) {
    const row = await db
      .prepare(
        `SELECT id FROM fuel_ledger
         WHERE clerk_user_id = ? AND kind = ? AND ref_type = ? AND ref_id = ?
         LIMIT 1`,
      )
      .bind(clerkUserId, kind, refType, refId)
      .first<{ id: string }>()
    return !!row
  }
  const row = await db
    .prepare(
      `SELECT id FROM fuel_ledger WHERE clerk_user_id = ? AND kind = ? LIMIT 1`,
    )
    .bind(clerkUserId, kind)
    .first<{ id: string }>()
  return !!row
}

/** 회원가입 1회 적립 (Clerk user.created) */
export async function tryEarnSignupFuel(
  clerkUserId: string,
  clerkEventId: string,
): Promise<{ awarded: boolean; amount: number }> {
  const settings = await getFuelSettings()
  const amount = settings.fuelSignup
  if (amount <= 0) return { awarded: false, amount: 0 }

  if (await hasFuelLedgerKind(clerkUserId, 'earn_signup')) {
    return { awarded: false, amount: 0 }
  }

  try {
    await addUserFuel(clerkUserId, amount, {
      kind: 'earn_signup',
      refType: 'clerk_event',
      refId: clerkEventId,
      meta: { source: 'user.created' },
    })
    return { awarded: true, amount }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return { awarded: false, amount: 0 }
    }
    throw err
  }
}

/** 회원가입 Fuel (웹훅·앱 진입 백업, 계정당 1회) */
export async function tryEarnSignupFuelForUser(
  clerkUserId: string,
): Promise<{ awarded: boolean; amount: number }> {
  return tryEarnSignupFuel(clerkUserId, `app_${clerkUserId}`)
}

/**
 * 로그인 Fuel — KST 달력 기준 1일 1회.
 * ref: login_day + YYYY-MM-DD (idx_fuel_ledger_earn_login_day 유니크)
 */
export async function tryEarnLoginFuel(
  clerkUserId: string,
  signedInAtIso: string,
  loginEventId: string,
): Promise<{ awarded: boolean; amount: number }> {
  const settings = await getFuelSettings()
  const amount = settings.fuelLogin
  if (amount <= 0) return { awarded: false, amount: 0 }

  const kstDay = kstDateStringFromIso(signedInAtIso)
  if (await hasFuelLedgerKind(clerkUserId, 'earn_login', 'login_day', kstDay)) {
    return { awarded: false, amount: 0 }
  }

  try {
    await addUserFuel(clerkUserId, amount, {
      kind: 'earn_login',
      refType: 'login_day',
      refId: kstDay,
      meta: { loginEventId, signedInAt: signedInAtIso, kstDay },
    })
    return { awarded: true, amount }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return { awarded: false, amount: 0 }
    }
    throw err
  }
}

/** 오늘(KST) 방금 적립된 로그인 Fuel — 클라이언트 토스트용 */
export async function getPendingSignupFuelToast(
  clerkUserId: string,
): Promise<PendingFuelToast> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT id, delta_available, created_at FROM fuel_ledger
       WHERE clerk_user_id = ? AND kind = 'earn_signup'
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(clerkUserId)
    .first<{ id: string; delta_available: number; created_at: string }>()

  if (!row || row.delta_available <= 0) {
    return { show: false, amount: 0, ledgerId: null }
  }

  const ageMs = Date.now() - parseStoredDate(row.created_at).getTime()
  if (ageMs < 0 || ageMs > SIGNUP_FUEL_TOAST_MAX_AGE_MS) {
    return { show: false, amount: 0, ledgerId: null }
  }

  return {
    show: true,
    amount: row.delta_available,
    ledgerId: row.id,
  }
}

export async function getPendingLoginFuelToast(
  clerkUserId: string,
): Promise<PendingFuelToast> {
  const kstDay = todayKstDateString()
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT id, delta_available, created_at FROM fuel_ledger
       WHERE clerk_user_id = ? AND kind = 'earn_login'
         AND ref_type = 'login_day' AND ref_id = ?
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(clerkUserId, kstDay)
    .first<{ id: string; delta_available: number; created_at: string }>()

  if (!row || row.delta_available <= 0) {
    return { show: false, amount: 0, ledgerId: null }
  }

  const ageMs = Date.now() - parseStoredDate(row.created_at).getTime()
  if (ageMs < 0 || ageMs > LOGIN_FUEL_TOAST_MAX_AGE_MS) {
    return { show: false, amount: 0, ledgerId: null }
  }

  return {
    show: true,
    amount: row.delta_available,
    ledgerId: row.id,
  }
}

/** Clerk 세션 기준 로그인 Fuel (웹훅 미수신·로컬 개발용) */
export async function earnLoginFuelForClerkSession(
  clerkSessionId: string,
  refKey: string,
): Promise<{ awarded: boolean; amount: number }> {
  try {
    const client = await clerkClient()
    const session = await client.sessions.getSession(clerkSessionId)
    const raw = session as {
      userId?: string
      user_id?: string
      createdAt?: number
      created_at?: number
    }
    const userId = raw.userId ?? raw.user_id
    const createdMs = raw.createdAt ?? raw.created_at
    if (!userId || createdMs == null || !Number.isFinite(Number(createdMs))) {
      return { awarded: false, amount: 0 }
    }
    return tryEarnLoginFuel(userId, msToKstIso(Number(createdMs)), refKey)
  } catch (error) {
    console.error('[earnLoginFuelForClerkSession]', error)
    return { awarded: false, amount: 0 }
  }
}

/** 로그인 사용자 직접 적립 시도 (일 1회, 클라이언트 백업) */
export async function tryEarnLoginFuelForUser(
  clerkUserId: string,
): Promise<{ awarded: boolean; amount: number }> {
  const kstDay = todayKstDateString()
  return tryEarnLoginFuel(
    clerkUserId,
    nowKstIso(),
    `app_${clerkUserId}_${kstDay}`,
  )
}
