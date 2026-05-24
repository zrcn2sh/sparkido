import { getDb } from '@/lib/db'
import { createId } from '@/lib/id'
import { nowKstIso } from '@/lib/datetime'
export type ShowTileReactionType = 'tried' | 'recommend'

type ReactionTileRow = {
  id: string
  owner_id: string
  placement_group_id: string | null
}

export type ShowTileReactionCounts = {
  triedCount: number
  recommendCount: number
}

export type ShowTileUserReactions = {
  hasTried: boolean
  hasRecommended: boolean
}

/** P1–P2 연결 타일은 그룹 단위로 집계 */
export function showTileTargetKey(
  placementGroupId: string | null,
  tileId: string,
): string {
  return placementGroupId ?? tileId
}

export function targetKeyFromRow(
  row: Pick<ReactionTileRow, 'id' | 'placement_group_id'>,
): string {
  return showTileTargetKey(row.placement_group_id, row.id)
}

export async function getShowTileReactionCounts(
  targetKeys: string[],
): Promise<Map<string, ShowTileReactionCounts>> {
  const map = new Map<string, ShowTileReactionCounts>()
  const unique = Array.from(new Set(targetKeys))
  if (unique.length === 0) return map

  const db = await getDb()
  const placeholders = unique.map(() => '?').join(', ')
  const { results } = await db
    .prepare(
      `SELECT target_key, reaction, COUNT(*) AS cnt
       FROM show_tile_reactions
       WHERE target_key IN (${placeholders})
       GROUP BY target_key, reaction`,
    )
    .bind(...unique)
    .all<{ target_key: string; reaction: ShowTileReactionType; cnt: number }>()

  for (const key of unique) {
    map.set(key, { triedCount: 0, recommendCount: 0 })
  }
  for (const row of results ?? []) {
    const entry = map.get(row.target_key)!
    if (row.reaction === 'tried') entry.triedCount = row.cnt
    else entry.recommendCount = row.cnt
  }
  return map
}

export async function getUserShowTileReactions(
  clerkUserId: string,
  targetKeys: string[],
): Promise<Map<string, ShowTileUserReactions>> {
  const map = new Map<string, ShowTileUserReactions>()
  const unique = Array.from(new Set(targetKeys))
  if (unique.length === 0) return map

  const db = await getDb()
  const placeholders = unique.map(() => '?').join(', ')
  const { results } = await db
    .prepare(
      `SELECT target_key, reaction FROM show_tile_reactions
       WHERE clerk_user_id = ? AND target_key IN (${placeholders})`,
    )
    .bind(clerkUserId, ...unique)
    .all<{ target_key: string; reaction: ShowTileReactionType }>()

  for (const key of unique) {
    map.set(key, { hasTried: false, hasRecommended: false })
  }
  for (const row of results ?? []) {
    const entry = map.get(row.target_key)!
    if (row.reaction === 'tried') entry.hasTried = true
    else entry.hasRecommended = true
  }
  return map
}

async function getActiveTileRowForReaction(
  tileId: string,
): Promise<ReactionTileRow | null> {
  const db = await getDb()
  return db
    .prepare(
      `SELECT id, owner_id, placement_group_id
       FROM show_tiles WHERE id = ? AND status = 'active'`,
    )
    .bind(tileId)
    .first<ReactionTileRow>()
}

export async function addShowTileReaction(
  tileId: string,
  clerkUserId: string,
  reaction: ShowTileReactionType,
): Promise<
  ShowTileReactionCounts &
    ShowTileUserReactions & { targetKey: string }
> {
  const row = await getActiveTileRowForReaction(tileId)
  if (!row) throw new Error('타일을 찾을 수 없습니다.')
  if (row.owner_id === clerkUserId) {
    throw new Error('본인이 등록한 타일에는 반응할 수 없습니다.')
  }

  const targetKey = targetKeyFromRow(row)
  const db = await getDb()

  const existing = await db
    .prepare(
      `SELECT id FROM show_tile_reactions
       WHERE clerk_user_id = ? AND target_key = ? AND reaction = ?`,
    )
    .bind(clerkUserId, targetKey, reaction)
    .first<{ id: string }>()

  if (!existing) {
    await db
      .prepare(
        `INSERT INTO show_tile_reactions (id, target_key, clerk_user_id, reaction, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(createId(), targetKey, clerkUserId, reaction, nowKstIso())
      .run()
  }

  const counts = await getShowTileReactionCounts([targetKey])
  const c = counts.get(targetKey) ?? { triedCount: 0, recommendCount: 0 }
  const user = await getUserShowTileReactions(clerkUserId, [targetKey])
  const u = user.get(targetKey) ?? { hasTried: false, hasRecommended: false }

  return {
    targetKey,
    triedCount: c.triedCount,
    recommendCount: c.recommendCount,
    hasTried: u.hasTried,
    hasRecommended: u.hasRecommended,
  }
}
