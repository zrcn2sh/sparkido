import { getDisplayNamesByUserIds } from '@/lib/auth'
import { getKstYmd, nowKstIso, parseStoredDate } from '@/lib/datetime'
import { calcShowUnusedDaysRefund } from '@/lib/show-fuel-refund'
import { refundUserFuel } from '@/lib/user-fuel'
import type { ShowTileCancelQuote } from '@/types/show'
import { getDb } from '@/lib/db'
import { createId } from '@/lib/id'
import { parseLabSourceUrl } from '@/lib/lab-links'
import {
  calcShowTileDailyFuel,
} from '@/lib/show-config'
import { getShowPublicConfig, getShowTileSizeLimits } from '@/lib/show-fuel'
import { recordShowTileEvent } from '@/lib/show-tile-events'
import {
  getShowTileReactionCounts,
  getUserShowTileReactions,
  showTileTargetKey,
  targetKeyFromRow,
} from '@/lib/show-tile-reactions'
import { spendUserFuel } from '@/lib/user-fuel'
import { SHOW_GRID_COLS, SHOW_GRID_ROWS } from '@/lib/show-grid'
import {
  formatPlacementLabel,
  formatShowTileSizeLimitMessage,
  placementsForEventMeta,
  isShowTileSizeAllowed,
  placementsGlobalBounds,
  type ShowGridPlacement,
} from '@/lib/show-selection'
import { assertValidUtf8Text } from '@/lib/text'
import type {
  ShowPage,
  ShowTile,
  ShowTileCategory,
  ShowTileKind,
} from '@/types/show'

export const SHOW_MIN_PAGE_COUNT = 4

type ShowTileRow = {
  id: string
  owner_id: string
  placement_group_id: string | null
  page_index: number
  col: number
  row: number
  width: number
  height: number
  title: string
  tagline: string
  kind: ShowTileKind
  category: ShowTileCategory
  image_url: string | null
  icon_text: string | null
  link_url: string | null
  fuel_ledger_id: string | null
  fuel_daily: number | null
  fuel_period_charged: number | null
  fuel_billing_month: string | null
  fuel_remaining_days: number | null
  status: string
  created_at: string
  updated_at: string
}

export type CreateShowTileMeta = {
  title: string
  tagline: string
  kind: ShowTileKind
  category: ShowTileCategory
  imageUrl?: string
  iconText?: string
  linkUrl?: string
}

const SELECT_COLS = `id, owner_id, placement_group_id, page_index, col, row, width, height,
  title, tagline, kind, category, image_url, icon_text, link_url,
  fuel_ledger_id, fuel_daily, fuel_period_charged, fuel_billing_month, fuel_remaining_days,
  status, created_at, updated_at`

function mapRow(
  row: ShowTileRow,
  ownerNickname: string,
  counts: { triedCount: number; recommendCount: number },
  userReactions?: { hasTried: boolean; hasRecommended: boolean },
): ShowTile {
  return {
    id: row.id,
    placementGroupId: row.placement_group_id,
    pageIndex: row.page_index,
    col: row.col,
    row: row.row,
    width: row.width,
    height: row.height,
    title: row.title,
    tagline: row.tagline,
    kind: row.kind,
    category: row.category,
    imageUrl: row.image_url,
    iconText: row.icon_text,
    linkUrl: row.link_url ?? undefined,
    ownerNickname,
    ownerId: row.owner_id,
    triedCount: counts.triedCount,
    recommendCount: counts.recommendCount,
    userHasTried: userReactions?.hasTried,
    userHasRecommended: userReactions?.hasRecommended,
    createdAt: row.created_at,
    fuelLedgerId: row.fuel_ledger_id,
    fuelDaily: row.fuel_daily,
    fuelPeriodCharged: row.fuel_period_charged,
    fuelRemainingDays: row.fuel_remaining_days,
  }
}

async function getActiveTileRow(
  tileId: string,
): Promise<ShowTileRow | null> {
  const db = await getDb()
  return db
    .prepare(
      `SELECT ${SELECT_COLS} FROM show_tiles WHERE id = ? AND status = 'active'`,
    )
    .bind(tileId)
    .first<ShowTileRow>()
}

async function listActiveTilesInGroup(
  row: ShowTileRow,
): Promise<ShowTileRow[]> {
  const db = await getDb()
  if (row.placement_group_id) {
    const { results } = await db
      .prepare(
        `SELECT ${SELECT_COLS} FROM show_tiles
         WHERE status = 'active' AND placement_group_id = ?`,
      )
      .bind(row.placement_group_id)
      .all<ShowTileRow>()
    return results ?? []
  }
  return [row]
}

function pickBillingAnchor(rows: ShowTileRow[]): ShowTileRow {
  return (
    rows.find((r) => r.fuel_ledger_id != null && r.fuel_daily != null) ?? rows[0]!
  )
}

async function hasRefundForSpendLedger(ledgerId: string): Promise<boolean> {
  const db = await getDb()
  const existing = await db
    .prepare(
      `SELECT id FROM fuel_ledger
       WHERE related_ledger_id = ? AND kind IN ('refund_show_unused', 'refund_show_removed')
       LIMIT 1`,
    )
    .bind(ledgerId)
    .first<{ id: string }>()
  return !!existing
}

function buildCancelQuote(anchor: ShowTileRow, at = new Date()): ShowTileCancelQuote {
  const daily = anchor.fuel_daily ?? 0
  const booked = anchor.fuel_remaining_days ?? 1
  const period = anchor.fuel_period_charged ?? daily * booked
  const { usedDays, unusedDays, refundAmount } = calcShowUnusedDaysRefund({
    dailyFuel: daily,
    remainingDaysAtRegister: booked,
    registeredAtKst: parseStoredDate(anchor.created_at),
    removedAtKst: at,
  })
  return {
    refundAmount,
    usedDays,
    unusedDays,
    dailyFuel: daily,
    periodCharged: period,
    remainingDaysAtRegister: booked,
  }
}

/** 등록자 게시 취소 환불 견적 (KST, 등록 당일=사용 1일) */
export async function getShowTileCancelQuote(
  tileId: string,
  ownerId: string,
): Promise<ShowTileCancelQuote> {
  const row = await getActiveTileRow(tileId)
  if (!row) throw new Error('타일을 찾을 수 없습니다.')
  if (row.owner_id !== ownerId) {
    throw new Error('본인이 등록한 타일만 게시 취소할 수 있습니다.')
  }
  return buildCancelQuote(pickBillingAnchor(await listActiveTilesInGroup(row)))
}

/** 등록자 게시 취소 — 그룹 타일 일괄 제거 + 미사용 일수 Fuel 환불 */
export async function cancelShowTileByOwner(
  tileId: string,
  ownerId: string,
): Promise<{ quote: ShowTileCancelQuote; removedCount: number }> {
  const row = await getActiveTileRow(tileId)
  if (!row) throw new Error('타일을 찾을 수 없습니다.')
  if (row.owner_id !== ownerId) {
    throw new Error('본인이 등록한 타일만 게시 취소할 수 있습니다.')
  }

  const group = await listActiveTilesInGroup(row)
  const anchor = pickBillingAnchor(group)
  const quote = buildCancelQuote(anchor)

  if (anchor.fuel_ledger_id && (await hasRefundForSpendLedger(anchor.fuel_ledger_id))) {
    throw new Error('이미 환불 처리된 타일입니다.')
  }

  const now = nowKstIso()
  const db = await getDb()

  for (const t of group) {
    await db
      .prepare(
        `UPDATE show_tiles SET status = 'removed', updated_at = ? WHERE id = ?`,
      )
      .bind(now, t.id)
      .run()
  }

  if (quote.refundAmount > 0 && anchor.fuel_ledger_id) {
    await refundUserFuel(ownerId, quote.refundAmount, {
      kind: 'refund_show_unused',
      refType: 'show_tile',
      refId: anchor.id,
      relatedLedgerId: anchor.fuel_ledger_id,
      meta: {
        usedDays: quote.usedDays,
        unusedDays: quote.unusedDays,
        dailyFuel: quote.dailyFuel,
        canceledAt: now,
      },
    })
  }

  const cancelPlacements = group.map((t) => ({
    pageIndex: t.page_index,
    col: t.col,
    row: t.row,
    width: t.width,
    height: t.height,
  }))
  const placementSummary = formatPlacementLabel(cancelPlacements)

  await recordShowTileEvent({
    action: 'cancel',
    actorType: 'user',
    actorUserId: ownerId,
    ownerId,
    primaryTileId: anchor.id,
    placementGroupId: anchor.placement_group_id,
    tileCount: group.length,
    title: anchor.title,
    fuelDaily: quote.dailyFuel,
    fuelPeriodCharged: quote.periodCharged,
    refundAmount: quote.refundAmount,
    meta: {
      usedDays: quote.usedDays,
      unusedDays: quote.unusedDays,
      placementSummary,
      placements: placementsForEventMeta(cancelPlacements),
      tileIds: group.map((t) => t.id),
    },
  })

  return { quote, removedCount: group.length }
}

function assertPlacement(placement: ShowGridPlacement) {
  if (placement.pageIndex < 0) {
    throw new Error('페이지를 선택해 주세요.')
  }
  if (
    placement.col < 0 ||
    placement.row < 0 ||
    placement.col + placement.width > SHOW_GRID_COLS ||
    placement.row + placement.height > SHOW_GRID_ROWS
  ) {
    throw new Error('그리드 범위를 벗어난 위치입니다.')
  }
  if (placement.width < 1 || placement.height < 1) {
    throw new Error('타일 크기가 올바르지 않습니다.')
  }
}

function rectanglesOverlap(
  a: { col: number; row: number; width: number; height: number },
  b: { col: number; row: number; width: number; height: number },
): boolean {
  return !(
    a.col + a.width <= b.col ||
    b.col + b.width <= a.col ||
    a.row + a.height <= b.row ||
    b.row + b.height <= a.row
  )
}

export async function listShowPages(viewerId?: string | null): Promise<ShowPage[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT ${SELECT_COLS} FROM show_tiles WHERE status = 'active' ORDER BY page_index, row, col`,
    )
    .all<ShowTileRow>()

  const rows = results ?? []
  const ownerIds = Array.from(new Set(rows.map((r) => r.owner_id)))
  const names = await getDisplayNamesByUserIds(ownerIds)

  const targetKeys = rows.map((r) => targetKeyFromRow(r))
  const countMap = await getShowTileReactionCounts(targetKeys)
  const userMap = viewerId
    ? await getUserShowTileReactions(viewerId, targetKeys)
    : null

  const tilesByPage = new Map<number, ShowTile[]>()
  for (const row of rows) {
    const key = showTileTargetKey(row.placement_group_id, row.id)
    const tile = mapRow(
      row,
      names[row.owner_id] ?? '알 수 없음',
      countMap.get(key) ?? { triedCount: 0, recommendCount: 0 },
      userMap?.get(key),
    )
    const list = tilesByPage.get(row.page_index) ?? []
    list.push(tile)
    tilesByPage.set(row.page_index, list)
  }

  const maxPage = rows.reduce(
    (max, r) => Math.max(max, r.page_index),
    SHOW_MIN_PAGE_COUNT - 1,
  )
  const pageCount = Math.max(SHOW_MIN_PAGE_COUNT, maxPage + 1)

  const pages: ShowPage[] = []
  for (let i = 0; i < pageCount; i++) {
    pages.push({
      pageIndex: i,
      tiles: tilesByPage.get(i) ?? [],
    })
  }
  return pages
}

export async function countActiveShowTiles(): Promise<number> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS cnt FROM show_tiles WHERE status = 'active'`,
    )
    .first<{ cnt: number }>()
  return row?.cnt ?? 0
}

export type PurgeShowTilesOptions = {
  actorType: 'admin' | 'cron'
  actorUserId?: string | null
  meta?: Record<string, unknown>
}

/** 활성 Show 타일 전체 소프트 삭제 (매월 1일·관리자 수동) */
export async function purgeAllShowTiles(
  options: PurgeShowTilesOptions,
): Promise<number> {
  const db = await getDb()
  const now = nowKstIso()
  const result = await db
    .prepare(
      `UPDATE show_tiles SET status = 'removed', updated_at = ?
       WHERE status = 'active'`,
    )
    .bind(now)
    .run()
  const changed = Number(
    (result.meta as { changes?: number } | undefined)?.changes ?? 0,
  )

  if (changed > 0) {
    await recordShowTileEvent({
      action: 'purge_all',
      actorType: options.actorType,
      actorUserId: options.actorUserId ?? null,
      tileCount: changed,
      meta: options.meta ?? null,
    })
  }

  return changed
}

function parseCreateMeta(meta: CreateShowTileMeta) {
  const title = assertValidUtf8Text(meta.title.trim(), '서비스명').slice(0, 60)
  const tagline = assertValidUtf8Text(meta.tagline.trim(), '소개').slice(0, 60)

  if (!title) throw new Error('서비스명을 입력해 주세요.')
  if (!tagline) throw new Error('소개를 입력해 주세요.')

  const imageUrl = meta.imageUrl?.trim()
    ? parseLabSourceUrl(meta.imageUrl.trim())
    : null
  const iconText = meta.iconText?.trim()
    ? assertValidUtf8Text(meta.iconText.trim(), '아이콘').slice(0, 8)
    : null

  if (!imageUrl && !iconText) {
    throw new Error('이미지 URL 또는 아이콘(이모지) 중 하나를 입력해 주세요.')
  }

  const linkUrl = meta.linkUrl?.trim()
    ? parseLabSourceUrl(meta.linkUrl.trim())
    : null
  if (!linkUrl) {
    throw new Error('바로가기 링크를 입력해 주세요.')
  }

  return { title, tagline, imageUrl, iconText, linkUrl }
}

/** 단일·다중 페이지(P1–P2 연결) 배치 */
export async function createShowTilePlacements(
  placements: ShowGridPlacement[],
  meta: CreateShowTileMeta,
  ownerId: string,
): Promise<ShowTile> {
  if (placements.length === 0) {
    throw new Error('배치할 영역을 선택해 주세요.')
  }

  for (const p of placements) {
    assertPlacement(p)
  }

  const sizeLimits = await getShowTileSizeLimits()
  const bounds = placementsGlobalBounds(placements)
  if (
    !bounds ||
    !isShowTileSizeAllowed(bounds.width, bounds.height, sizeLimits)
  ) {
    throw new Error(formatShowTileSizeLimitMessage(sizeLimits))
  }

  const showConfig = await getShowPublicConfig()
  const dailyFuel = calcShowTileDailyFuel(
    bounds.width,
    bounds.height,
    showConfig.rates,
  )
  const remainingDays = showConfig.remainingDaysInMonth
  const isAlpha = showConfig.isAlphaPeriod
  const periodFuel = isAlpha ? 0 : dailyFuel * remainingDays
  const { year, month } = getKstYmd()
  const billingMonth = `${year}-${String(month).padStart(2, '0')}`

  const { title, tagline, imageUrl, iconText, linkUrl } = parseCreateMeta(meta)
  const db = await getDb()
  const groupId = placements.length > 1 ? createId() : null
  const now = nowKstIso()
  const primaryTileId = createId()

  let ledgerId: string | null = null
  if (!isAlpha) {
    const spent = await spendUserFuel(ownerId, periodFuel, {
      kind: 'spend_show_tile',
      refType: 'show_tile',
      refId: primaryTileId,
      meta: {
        dailyFuel,
        periodFuel,
        remainingDays,
        billingMonth,
        width: bounds.width,
        height: bounds.height,
      },
    })
    ledgerId = spent.ledgerId
  }

  let primary: ShowTile | null = null

  for (const placement of placements) {
    const existing = await db
      .prepare(
        `SELECT col, row, width, height FROM show_tiles
         WHERE status = 'active' AND page_index = ?`,
      )
      .bind(placement.pageIndex)
      .all<{ col: number; row: number; width: number; height: number }>()

    const box = {
      col: placement.col,
      row: placement.row,
      width: placement.width,
      height: placement.height,
    }

    for (const other of existing.results ?? []) {
      if (rectanglesOverlap(box, other)) {
        throw new Error(
          `P${placement.pageIndex + 1}에 이미 타일이 있어 배치할 수 없습니다.`,
        )
      }
    }

    const tileId = primary ? createId() : primaryTileId
    await db
      .prepare(
        `INSERT INTO show_tiles (
          id, owner_id, placement_group_id, page_index, col, row, width, height,
          title, tagline, kind, category, image_url, icon_text, link_url,
          fuel_ledger_id, fuel_daily, fuel_period_charged, fuel_billing_month, fuel_remaining_days,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      )
      .bind(
        tileId,
        ownerId,
        groupId,
        placement.pageIndex,
        placement.col,
        placement.row,
        placement.width,
        placement.height,
        title,
        tagline,
        meta.kind,
        meta.category,
        imageUrl,
        iconText,
        linkUrl,
        ledgerId,
        dailyFuel,
        periodFuel,
        billingMonth,
        remainingDays,
        now,
        now,
      )
      .run()

    if (!primary) {
      const names = await getDisplayNamesByUserIds([ownerId])
      primary = mapRow(
        {
          id: tileId,
          owner_id: ownerId,
          placement_group_id: groupId,
          page_index: placement.pageIndex,
          col: placement.col,
          row: placement.row,
          width: placement.width,
          height: placement.height,
          title,
          tagline,
          kind: meta.kind,
          category: meta.category,
          image_url: imageUrl,
          icon_text: iconText,
          link_url: linkUrl,
          fuel_ledger_id: ledgerId,
          fuel_daily: dailyFuel,
          fuel_period_charged: periodFuel,
          fuel_billing_month: billingMonth,
          fuel_remaining_days: remainingDays,
          status: 'active',
          created_at: now,
          updated_at: now,
        },
        names[ownerId] ?? '알 수 없음',
        { triedCount: 0, recommendCount: 0 },
      )
    }
  }

  const placementSummary = formatPlacementLabel(placements)

  await recordShowTileEvent({
    action: 'register',
    actorType: 'user',
    actorUserId: ownerId,
    ownerId,
    primaryTileId: primaryTileId,
    placementGroupId: groupId,
    tileCount: placements.length,
    title,
    fuelDaily: dailyFuel,
    fuelPeriodCharged: periodFuel,
    meta: {
      isAlpha,
      remainingDays,
      billingMonth,
      bounds,
      placementSummary,
      placements: placementsForEventMeta(placements),
      kind: meta.kind,
      category: meta.category,
    },
  })

  return primary!
}

/** 단일 페이지 배치 (호환) */
export async function createShowTile(
  input: ShowGridPlacement & CreateShowTileMeta,
  ownerId: string,
): Promise<ShowTile> {
  const { title, tagline, kind, category, imageUrl, iconText, linkUrl, ...placement } =
    input
  return createShowTilePlacements(
    [placement],
    { title, tagline, kind, category, imageUrl, iconText, linkUrl },
    ownerId,
  )
}
