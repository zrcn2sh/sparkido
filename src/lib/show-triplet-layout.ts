import { SHOW_GRID_COLS, SHOW_GRID_ROWS } from '@/lib/show-grid'
import type { ShowPage, ShowTile } from '@/types/show'

export type ShowTileRenderSpec = {
  tile: ShowTile
  gridColumn: string
  gridRow: string
}

function tripletPageIndex(
  tripletPages: ShowPage[],
  pageIndex: number,
): number {
  return tripletPages.findIndex((p) => p.pageIndex === pageIndex)
}

function globalCol(tripletIdx: number, col: number) {
  return tripletIdx * SHOW_GRID_COLS + col
}

function specBounds(spec: ShowTileRenderSpec) {
  const colMatch = spec.gridColumn.match(/(\d+)\s*\/\s*span\s*(\d+)/)
  const rowMatch = spec.gridRow.match(/(\d+)\s*\/\s*span\s*(\d+)/)
  if (!colMatch || !rowMatch) return null
  const colStart = Number(colMatch[1]) - 1
  const colSpan = Number(colMatch[2])
  const rowStart = Number(rowMatch[1]) - 1
  const rowSpan = Number(rowMatch[2])
  return { colStart, colEnd: colStart + colSpan, rowStart, rowEnd: rowStart + rowSpan }
}

/** 슬라이드 내 통합 그리드용 — 연결 타일은 하나로 합침 */
export function buildTripletRenderTiles(
  tripletPages: ShowPage[],
): ShowTileRenderSpec[] {
  const seenGroups = new Set<string>()
  const specs: ShowTileRenderSpec[] = []

  for (const page of tripletPages) {
    for (const tile of page.tiles) {
      if (tile.placementGroupId) {
        if (seenGroups.has(tile.placementGroupId)) continue
        seenGroups.add(tile.placementGroupId)

        const parts = tripletPages.flatMap((p) =>
          p.tiles.filter((t) => t.placementGroupId === tile.placementGroupId),
        )

        let minCol = Infinity
        let maxCol = -Infinity
        let minRow = Infinity
        let maxRow = -Infinity

        for (const part of parts) {
          const tIdx = tripletPageIndex(tripletPages, part.pageIndex)
          if (tIdx < 0) continue
          const g0 = globalCol(tIdx, part.col)
          minCol = Math.min(minCol, g0)
          maxCol = Math.max(maxCol, g0 + part.width)
          minRow = Math.min(minRow, part.row)
          maxRow = Math.max(maxRow, part.row + part.height)
        }

        specs.push({
          tile: parts[0]!,
          gridColumn: `${minCol + 1} / span ${maxCol - minCol}`,
          gridRow: `${minRow + 1} / span ${maxRow - minRow}`,
        })
      } else {
        const tIdx = tripletPageIndex(tripletPages, tile.pageIndex)
        if (tIdx < 0) continue
        specs.push({
          tile,
          gridColumn: `${globalCol(tIdx, tile.col) + 1} / span ${tile.width}`,
          gridRow: `${tile.row + 1} / span ${tile.height}`,
        })
      }
    }
  }

  return specs
}

export function isTripletCellOccupied(
  tripletPages: ShowPage[],
  pageIndex: number,
  col: number,
  row: number,
): boolean {
  const tIdx = tripletPageIndex(tripletPages, pageIndex)
  if (tIdx < 0) return false
  const gCol = globalCol(tIdx, col)

  for (const spec of buildTripletRenderTiles(tripletPages)) {
    const b = specBounds(spec)
    if (!b) continue
    if (
      gCol >= b.colStart &&
      gCol < b.colEnd &&
      row >= b.rowStart &&
      row < b.rowEnd
    ) {
      return true
    }
  }
  return false
}

export function tripletGridColumnCount(tripletPages: ShowPage[]) {
  return SHOW_GRID_COLS * tripletPages.length
}

export function tripletGridTemplateColumns(pageCount: number) {
  return `repeat(${SHOW_GRID_COLS * pageCount}, minmax(0, 1fr))`
}

export { SHOW_GRID_ROWS }
