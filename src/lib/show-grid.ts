import type { ShowTile } from '@/types/show'

/** Show 그리드: 페이지당 6×9, 셀 단위 정사각형 */
export const SHOW_GRID_COLS = 6
export const SHOW_GRID_ROWS = 9

/** 타일 등록 최소 크기 (바운딩 박스, 고정) */
export const SHOW_TILE_MIN_DIM = 1

/** 그리드 셀·페이지(P1|P2) 열 사이 동일 간격 */
export const SHOW_GRID_GAP_CLASS = 'gap-0.5 sm:gap-1'

/** 슬라이드(3페이지 묶음) 바깥 여백 */
export const SHOW_GRID_PAD_CLASS = 'px-1.5 sm:px-2'

export function isShowGridCellOccupied(
  tiles: ShowTile[],
  col: number,
  row: number,
): boolean {
  return tiles.some(
    (t) =>
      col >= t.col &&
      col < t.col + t.width &&
      row >= t.row &&
      row < t.row + t.height,
  )
}

export function findShowTileAtOrigin(
  tiles: ShowTile[],
  col: number,
  row: number,
): ShowTile | undefined {
  return tiles.find((t) => t.col === col && t.row === row)
}
