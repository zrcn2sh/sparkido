import { KST_OFFSET, KST_TIMEZONE } from '@/lib/datetime'
import { getDb } from '@/lib/db'
import type { FuelLedgerEntry } from '@/lib/fuel-ledger'
import { getUserFuelBalance } from '@/lib/user-fuel'

export type AdminFuelLedgerQuery = {
  clerkUserId?: string
  /** KST YYYY-MM-DD */
  dateFrom?: string
  /** KST YYYY-MM-DD (당일 포함) */
  dateTo?: string
  limit?: number
  offset?: number
}

export type AdminFuelLedgerRow = FuelLedgerEntry & {
  nickname: string | null
}

export type AdminFuelLedgerResult = {
  entries: AdminFuelLedgerRow[]
  totalCount: number
  balance: { available: number; total: number } | null
}

type FuelLedgerDbRow = {
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
  nickname: string | null
}

function mapDbRow(row: FuelLedgerDbRow): AdminFuelLedgerRow {
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
    kind: row.kind as FuelLedgerEntry['kind'],
    deltaAvailable: row.delta_available,
    deltaTotal: row.delta_total,
    availableAfter: row.available_after,
    totalAfter: row.total_after,
    refType: row.ref_type,
    refId: row.ref_id,
    relatedLedgerId: row.related_ledger_id,
    meta,
    createdAt: row.created_at,
    nickname: row.nickname,
  }
}

/** KST 날짜 → ISO 범위 (dateTo 당일 23:59:59 포함) */
export function kstDateRangeToIsoBounds(
  dateFrom?: string,
  dateTo?: string,
): { fromIso?: string; toIsoExclusive?: string } {
  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  let fromIso: string | undefined
  let toIsoExclusive: string | undefined

  if (dateFrom && dateRe.test(dateFrom)) {
    fromIso = `${dateFrom}T00:00:00${KST_OFFSET}`
  }
  if (dateTo && dateRe.test(dateTo)) {
    const [y, m, d] = dateTo.split('-').map(Number)
    const next = new Date(y, m - 1, d + 1)
    const ny = next.getFullYear()
    const nm = String(next.getMonth() + 1).padStart(2, '0')
    const nd = String(next.getDate()).padStart(2, '0')
    toIsoExclusive = `${ny}-${nm}-${nd}T00:00:00${KST_OFFSET}`
  }

  return { fromIso, toIsoExclusive }
}

/** Admin Fuel 원장 검색 */
export async function searchAdminFuelLedger(
  query: AdminFuelLedgerQuery,
): Promise<AdminFuelLedgerResult> {
  const db = await getDb()
  const limit = Math.min(200, Math.max(1, query.limit ?? 50))
  const offset = Math.max(0, query.offset ?? 0)
  const { fromIso, toIsoExclusive } = kstDateRangeToIsoBounds(
    query.dateFrom,
    query.dateTo,
  )

  const conditions: string[] = []
  const binds: unknown[] = []

  if (query.clerkUserId?.trim()) {
    conditions.push('fl.clerk_user_id = ?')
    binds.push(query.clerkUserId.trim())
  }
  if (fromIso) {
    conditions.push('fl.created_at >= ?')
    binds.push(fromIso)
  }
  if (toIsoExclusive) {
    conditions.push('fl.created_at < ?')
    binds.push(toIsoExclusive)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countRow = await db
    .prepare(
      `SELECT COUNT(*) AS cnt FROM fuel_ledger fl ${where}`,
    )
    .bind(...binds)
    .first<{ cnt: number }>()

  const totalCount = countRow?.cnt ?? 0

  const { results } = await db
    .prepare(
      `SELECT fl.id, fl.clerk_user_id, fl.kind, fl.delta_available, fl.delta_total,
              fl.available_after, fl.total_after, fl.ref_type, fl.ref_id,
              fl.related_ledger_id, fl.meta_json, fl.created_at,
              up.nickname
       FROM fuel_ledger fl
       LEFT JOIN user_profiles up ON up.clerk_user_id = fl.clerk_user_id
       ${where}
       ORDER BY fl.created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(...binds, limit, offset)
    .all<FuelLedgerDbRow>()

  const balance = query.clerkUserId?.trim()
    ? await getUserFuelBalance(query.clerkUserId.trim())
    : null

  return {
    entries: (results ?? []).map(mapDbRow),
    totalCount,
    balance,
  }
}

/** KST 오늘 YYYY-MM-DD */
export function todayKstDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
