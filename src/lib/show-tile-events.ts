import { nowKstIso } from '@/lib/datetime'
import { getDb } from '@/lib/db'
import { createId } from '@/lib/id'

export type ShowTileEventAction = 'register' | 'cancel' | 'purge_all'
export type ShowTileEventActorType = 'user' | 'admin' | 'cron'

export type RecordShowTileEventInput = {
  action: ShowTileEventAction
  actorType: ShowTileEventActorType
  actorUserId?: string | null
  ownerId?: string | null
  primaryTileId?: string | null
  placementGroupId?: string | null
  tileCount?: number
  title?: string | null
  fuelDaily?: number | null
  fuelPeriodCharged?: number | null
  refundAmount?: number | null
  meta?: Record<string, unknown> | null
}

/** Show 등록·삭제 이력 1건 기록 */
export async function recordShowTileEvent(
  input: RecordShowTileEventInput,
): Promise<string> {
  const db = await getDb()
  const id = createId()
  const now = nowKstIso()
  const metaJson = input.meta ? JSON.stringify(input.meta) : null

  await db
    .prepare(
      `INSERT INTO show_tile_events (
         id, action, actor_type, actor_user_id, owner_id,
         primary_tile_id, placement_group_id, tile_count, title,
         fuel_daily, fuel_period_charged, refund_amount, meta_json, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.action,
      input.actorType,
      input.actorUserId ?? null,
      input.ownerId ?? null,
      input.primaryTileId ?? null,
      input.placementGroupId ?? null,
      Math.max(1, input.tileCount ?? 1),
      input.title ?? null,
      input.fuelDaily ?? null,
      input.fuelPeriodCharged ?? null,
      input.refundAmount ?? null,
      metaJson,
      now,
    )
    .run()

  return id
}
