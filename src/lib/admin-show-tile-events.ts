import { kstDateRangeToIsoBounds } from '@/lib/admin-fuel-ledger'
import { getDb } from '@/lib/db'
import type {
  ShowTileEventAction,
  ShowTileEventActorType,
} from '@/lib/show-tile-events'

export type AdminShowTileEventsQuery = {
  clerkUserId?: string
  action?: ShowTileEventAction
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export type AdminShowTileEventRow = {
  id: string
  action: ShowTileEventAction
  actorType: ShowTileEventActorType
  actorUserId: string | null
  ownerId: string | null
  primaryTileId: string | null
  placementGroupId: string | null
  tileCount: number
  title: string | null
  fuelDaily: number | null
  fuelPeriodCharged: number | null
  refundAmount: number | null
  meta: Record<string, unknown> | null
  createdAt: string
  ownerNickname: string | null
  actorNickname: string | null
}

export type AdminShowTileEventsResult = {
  entries: AdminShowTileEventRow[]
  totalCount: number
}

type ShowTileEventDbRow = {
  id: string
  action: string
  actor_type: string
  actor_user_id: string | null
  owner_id: string | null
  primary_tile_id: string | null
  placement_group_id: string | null
  tile_count: number
  title: string | null
  fuel_daily: number | null
  fuel_period_charged: number | null
  refund_amount: number | null
  meta_json: string | null
  created_at: string
  owner_nickname: string | null
  actor_nickname: string | null
}

function mapDbRow(row: ShowTileEventDbRow): AdminShowTileEventRow {
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
    action: row.action as ShowTileEventAction,
    actorType: row.actor_type as ShowTileEventActorType,
    actorUserId: row.actor_user_id,
    ownerId: row.owner_id,
    primaryTileId: row.primary_tile_id,
    placementGroupId: row.placement_group_id,
    tileCount: row.tile_count,
    title: row.title,
    fuelDaily: row.fuel_daily,
    fuelPeriodCharged: row.fuel_period_charged,
    refundAmount: row.refund_amount,
    meta,
    createdAt: row.created_at,
    ownerNickname: row.owner_nickname,
    actorNickname: row.actor_nickname,
  }
}

export async function searchAdminShowTileEvents(
  query: AdminShowTileEventsQuery,
): Promise<AdminShowTileEventsResult> {
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
    conditions.push('e.owner_id = ?')
    binds.push(query.clerkUserId.trim())
  }
  if (query.action) {
    conditions.push('e.action = ?')
    binds.push(query.action)
  }
  if (fromIso) {
    conditions.push('e.created_at >= ?')
    binds.push(fromIso)
  }
  if (toIsoExclusive) {
    conditions.push('e.created_at < ?')
    binds.push(toIsoExclusive)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS cnt FROM show_tile_events e ${where}`)
    .bind(...binds)
    .first<{ cnt: number }>()

  const totalCount = countRow?.cnt ?? 0

  const { results } = await db
    .prepare(
      `SELECT e.id, e.action, e.actor_type, e.actor_user_id, e.owner_id,
              e.primary_tile_id, e.placement_group_id, e.tile_count, e.title,
              e.fuel_daily, e.fuel_period_charged, e.refund_amount, e.meta_json,
              e.created_at,
              owner_p.nickname AS owner_nickname,
              actor_p.nickname AS actor_nickname
       FROM show_tile_events e
       LEFT JOIN user_profiles owner_p ON owner_p.clerk_user_id = e.owner_id
       LEFT JOIN user_profiles actor_p ON actor_p.clerk_user_id = e.actor_user_id
       ${where}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(...binds, limit, offset)
    .all<ShowTileEventDbRow>()

  return {
    entries: (results ?? []).map(mapDbRow),
    totalCount,
  }
}
