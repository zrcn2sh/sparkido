import { SHOW_GRID_COLS, SHOW_TILE_MIN_DIM } from '@/lib/show-grid'
import type { ShowTileSizeLimits } from '@/lib/show-config'

export type ShowGridSelectionCell = {
  pageIndex: number
  col: number
  row: number
}

export type ShowGridPlacement = {
  pageIndex: number
  col: number
  row: number
  width: number
  height: number
}

/** @deprecated 단일 페이지 — selectionToPlacements 사용 */
export type ShowGridRect = ShowGridPlacement

export const SHOW_SELECTION_INVALID_SHAPE_MESSAGE =
  '선택 영역이 사각형이 아닙니다. 직사각형 또는 정사각형 모양으로 영역을 다시 선택해 주세요.'

export const SHOW_SELECTION_NON_ADJACENT_PAGES_MESSAGE =
  'P1·P2처럼 이웃한 페이지만 연결할 수 있습니다. 건너뛴 페이지 없이 다시 선택해 주세요.'

export function formatShowTileSizeLimitMessage(
  limits: ShowTileSizeLimits,
): string {
  return `등록 가능한 크기는 ${SHOW_TILE_MIN_DIM}×${SHOW_TILE_MIN_DIM} ~ ${limits.maxCols}×${limits.maxRows}입니다. 영역을 다시 선택해 주세요.`
}

export function isShowTileSizeAllowed(
  width: number,
  height: number,
  limits: ShowTileSizeLimits,
): boolean {
  return (
    width >= SHOW_TILE_MIN_DIM &&
    width <= limits.maxCols &&
    height >= SHOW_TILE_MIN_DIM &&
    height <= limits.maxRows
  )
}

/** 유효 선택의 전역 바운딩 박스 (P1–P2 가로 연결 포함) */
export function selectionGlobalBounds(
  cells: ShowGridSelectionCell[],
): { width: number; height: number } | null {
  if (!selectionToPlacements(cells)) return null

  const pageIndices = [...new Set(cells.map((c) => c.pageIndex))].sort(
    (a, b) => a - b,
  )

  let minGCol = Infinity
  let maxGCol = -Infinity
  let minRow = Infinity
  let maxRow = -Infinity

  for (const c of cells) {
    const pIdx = pageIndices.indexOf(c.pageIndex)
    if (pIdx < 0) continue
    const gCol = pIdx * SHOW_GRID_COLS + c.col
    minGCol = Math.min(minGCol, gCol)
    maxGCol = Math.max(maxGCol, gCol)
    minRow = Math.min(minRow, c.row)
    maxRow = Math.max(maxRow, c.row)
  }

  return {
    width: maxGCol - minGCol + 1,
    height: maxRow - minRow + 1,
  }
}

/** API·DB 검증용 — 배치 목록의 전역 크기 */
export function placementsGlobalBounds(
  placements: ShowGridPlacement[],
): { width: number; height: number } | null {
  if (placements.length === 0) return null

  const pageIndices = [...new Set(placements.map((p) => p.pageIndex))].sort(
    (a, b) => a - b,
  )
  for (let i = 1; i < pageIndices.length; i++) {
    if (pageIndices[i]! - pageIndices[i - 1]! !== 1) return null
  }

  let minGCol = Infinity
  let maxGCol = -Infinity
  let minRow = Infinity
  let maxRow = -Infinity

  for (const p of placements) {
    const pIdx = pageIndices.indexOf(p.pageIndex)
    if (pIdx < 0) continue
    const gColStart = pIdx * SHOW_GRID_COLS + p.col
    minGCol = Math.min(minGCol, gColStart)
    maxGCol = Math.max(maxGCol, gColStart + p.width - 1)
    minRow = Math.min(minRow, p.row)
    maxRow = Math.max(maxRow, p.row + p.height - 1)
  }

  return {
    width: maxGCol - minGCol + 1,
    height: maxRow - minRow + 1,
  }
}

function globalKey(pageIndex: number, col: number, row: number) {
  return `${pageIndex * SHOW_GRID_COLS + col},${row}`
}

/**
 * 선택 영역 → 페이지별 배치 목록
 * P1|P2 가로 연결: 전역 (페이지×6+열, 행) 좌표에서 축 정렬 직사각형이면 허용
 */
export function selectionToPlacements(
  cells: ShowGridSelectionCell[],
): ShowGridPlacement[] | null {
  if (cells.length === 0) return null

  const globals = cells.map((c) => ({
    gx: c.pageIndex * SHOW_GRID_COLS + c.col,
    gy: c.row,
    pageIndex: c.pageIndex,
    col: c.col,
    row: c.row,
  }))

  const minGx = Math.min(...globals.map((g) => g.gx))
  const maxGx = Math.max(...globals.map((g) => g.gx))
  const minGy = Math.min(...globals.map((g) => g.gy))
  const maxGy = Math.max(...globals.map((g) => g.gy))
  const gWidth = maxGx - minGx + 1
  const gHeight = maxGy - minGy + 1

  if (cells.length !== gWidth * gHeight) return null

  const set = new Set(globals.map((g) => globalKey(g.pageIndex, g.col, g.row)))
  for (let gy = minGy; gy <= maxGy; gy++) {
    for (let gx = minGx; gx <= maxGx; gx++) {
      const pageIndex = Math.floor(gx / SHOW_GRID_COLS)
      const col = gx % SHOW_GRID_COLS
      if (!set.has(globalKey(pageIndex, col, gy))) return null
    }
  }

  const pageIndices = [...new Set(cells.map((c) => c.pageIndex))].sort(
    (a, b) => a - b,
  )
  for (let i = 1; i < pageIndices.length; i++) {
    if (pageIndices[i]! - pageIndices[i - 1]! !== 1) {
      return null
    }
  }

  return pageIndices.map((pageIndex) => {
    const pageCells = cells.filter((c) => c.pageIndex === pageIndex)
    const cols = pageCells.map((c) => c.col)
    const rows = pageCells.map((c) => c.row)
    return {
      pageIndex,
      col: Math.min(...cols),
      row: Math.min(...rows),
      width: Math.max(...cols) - Math.min(...cols) + 1,
      height: Math.max(...rows) - Math.min(...rows) + 1,
    }
  })
}

/** 단일 페이지 선택 시 기존 호환 */
export function selectionToRectangle(
  cells: ShowGridSelectionCell[],
): ShowGridRect | null {
  const placements = selectionToPlacements(cells)
  if (!placements || placements.length !== 1) return null
  return placements[0]!
}

export function formatPlacementLabel(placements: ShowGridPlacement[]): string {
  const pages = placements.map((p) => `P${p.pageIndex + 1}`)
  const unique = [...new Set(pages)]
  if (unique.length === 1) {
    const p = placements[0]!
    return `P${p.pageIndex + 1} · ${p.width}×${p.height}칸`
  }
  return `${unique.join('–')} 연결 · ${placements.map((p) => `${p.width}×${p.height}`).join(' + ')}칸`
}

/** Show 이력 meta_json.placements — 0-based 그리드 좌표 */
export function placementsForEventMeta(
  placements: ShowGridPlacement[],
): ShowGridPlacement[] {
  return placements.map(({ pageIndex, col, row, width, height }) => ({
    pageIndex,
    col,
    row,
    width,
    height,
  }))
}

/** Admin·로그용 — 1-based 열·행 표기 (예: P1 (3,2) 2×4) */
export function formatPlacementCoordinates(
  placements: ShowGridPlacement[],
): string {
  return placements
    .map(
      (p) =>
        `P${p.pageIndex + 1} (${p.col + 1},${p.row + 1}) ${p.width}×${p.height}`,
    )
    .join(' · ')
}

function isShowGridPlacement(value: unknown): value is ShowGridPlacement {
  if (!value || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  return (
    Number.isInteger(o.pageIndex) &&
    Number.isInteger(o.col) &&
    Number.isInteger(o.row) &&
    Number.isInteger(o.width) &&
    Number.isInteger(o.height)
  )
}

/** 이력 meta에서 배치 좌표 파싱 (구 이력은 placementSummary만 있을 수 있음) */
export function parsePlacementsFromEventMeta(
  meta: Record<string, unknown> | null,
): ShowGridPlacement[] | null {
  if (!meta) return null
  const raw = meta.placements
  if (!Array.isArray(raw)) return null
  const placements = raw.filter(isShowGridPlacement)
  return placements.length > 0 ? placements : null
}

export function formatEventPlacementMeta(
  meta: Record<string, unknown> | null,
): string {
  const placements = parsePlacementsFromEventMeta(meta)
  if (placements) return formatPlacementCoordinates(placements)
  const summary = meta?.placementSummary
  return typeof summary === 'string' && summary.length > 0 ? summary : '—'
}

/** 등록 불가 시 표시할 메시지 */
export function getSelectionErrorMessage(
  cells: ShowGridSelectionCell[],
  sizeLimits?: ShowTileSizeLimits,
): string | null {
  if (cells.length === 0) {
    return '빈 칸을 선택한 뒤 타일 등록을 눌러 주세요.'
  }

  const pageIndices = [...new Set(cells.map((c) => c.pageIndex))].sort(
    (a, b) => a - b,
  )
  for (let i = 1; i < pageIndices.length; i++) {
    if (pageIndices[i]! - pageIndices[i - 1]! > 1) {
      return SHOW_SELECTION_NON_ADJACENT_PAGES_MESSAGE
    }
  }

  if (!selectionToPlacements(cells)) {
    return SHOW_SELECTION_INVALID_SHAPE_MESSAGE
  }

  if (sizeLimits) {
    const bounds = selectionGlobalBounds(cells)
    if (
      bounds &&
      !isShowTileSizeAllowed(bounds.width, bounds.height, sizeLimits)
    ) {
      return formatShowTileSizeLimitMessage(sizeLimits)
    }
  }

  return null
}

export function toggleSelectionCell(
  cells: ShowGridSelectionCell[],
  cell: ShowGridSelectionCell,
): ShowGridSelectionCell[] {
  const key = `${cell.pageIndex}:${cell.col},${cell.row}`
  const exists = cells.some(
    (c) => `${c.pageIndex}:${c.col},${c.row}` === key,
  )
  if (exists) {
    return cells.filter((c) => `${c.pageIndex}:${c.col},${c.row}` !== key)
  }
  return [...cells, cell]
}
