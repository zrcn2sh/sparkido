'use client'

import { ShowTileCard } from '@/components/show/ShowTileCard'
import {
  SHOW_GRID_COLS,
  SHOW_GRID_GAP_CLASS,
  SHOW_GRID_PAD_CLASS,
  SHOW_GRID_ROWS,
} from '@/lib/show-grid'
import {
  buildTripletRenderTiles,
  isTripletCellOccupied,
  tripletGridTemplateColumns,
} from '@/lib/show-triplet-layout'
import { cn } from '@/lib/utils'
import type { ShowGridSelectionCell } from '@/lib/show-selection'
import type { ShowPage, ShowTile } from '@/types/show'

function isCellSelected(
  selected: ShowGridSelectionCell[],
  pageIndex: number,
  col: number,
  row: number,
) {
  return selected.some(
    (c) => c.pageIndex === pageIndex && c.col === col && c.row === row,
  )
}

type ShowTripletGridProps = {
  pages: ShowPage[]
  onTileClick: (tile: ShowTile) => void
  selectionEnabled?: boolean
  selectedCells?: ShowGridSelectionCell[]
  onToggleCell?: (cell: ShowGridSelectionCell) => void
}

export function ShowTripletGrid({
  pages,
  onTileClick,
  selectionEnabled = false,
  selectedCells = [],
  onToggleCell,
}: ShowTripletGridProps) {
  const renderTiles = buildTripletRenderTiles(pages)

  const slots = []
  for (const page of pages) {
    for (let row = 0; row < SHOW_GRID_ROWS; row++) {
      for (let col = 0; col < SHOW_GRID_COLS; col++) {
        const occupied = isTripletCellOccupied(pages, page.pageIndex, col, row)
        const pageIdx = pages.findIndex((p) => p.pageIndex === page.pageIndex)
        const gridCol = pageIdx * SHOW_GRID_COLS + col + 1
        const gridRow = row + 1

        const base =
          'aspect-square w-full min-h-0 min-w-0 rounded-sm border border-border/70'

        if (occupied) {
          slots.push(
            <div
              key={`slot-${page.pageIndex}-${col}-${row}`}
              className={cn(base, 'bg-muted')}
              style={{ gridColumn: gridCol, gridRow }}
              aria-hidden
            />,
          )
        } else if (selectionEnabled && onToggleCell) {
          const selected = isCellSelected(
            selectedCells,
            page.pageIndex,
            col,
            row,
          )
          slots.push(
            <button
              key={`slot-${page.pageIndex}-${col}-${row}`}
              type="button"
              onClick={() =>
                onToggleCell({ pageIndex: page.pageIndex, col, row })
              }
              className={cn(
                base,
                'cursor-pointer transition-colors',
                selected
                  ? 'border-primary bg-primary/20 ring-2 ring-primary/50'
                  : 'bg-muted hover:bg-muted/80',
              )}
              style={{ gridColumn: gridCol, gridRow }}
              aria-pressed={selected}
            />,
          )
        } else {
          slots.push(
            <div
              key={`slot-${page.pageIndex}-${col}-${row}`}
              className={cn(base, 'bg-muted')}
              style={{ gridColumn: gridCol, gridRow }}
              aria-hidden
            />,
          )
        }
      }
    }
  }

  return (
    <div className={cn('min-w-0 flex-1', SHOW_GRID_PAD_CLASS)}>
      <div
        className="grid"
        style={{ gridTemplateColumns: tripletGridTemplateColumns(pages.length) }}
      >
        {pages.map((page, i) => (
          <div
            key={`label-${page.pageIndex}`}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
            style={{
              gridColumn: `${i * SHOW_GRID_COLS + 1} / span ${SHOW_GRID_COLS}`,
              gridRow: 1,
            }}
          >
            P{page.pageIndex + 1}
          </div>
        ))}
      </div>

      <div
        className={cn('grid w-full pb-2', SHOW_GRID_GAP_CLASS)}
        style={{
          gridTemplateColumns: tripletGridTemplateColumns(pages.length),
          gridTemplateRows: `repeat(${SHOW_GRID_ROWS}, auto)`,
        }}
      >
        {slots}
        {renderTiles.map((spec) => (
          <ShowTileCard
            key={spec.tile.placementGroupId ?? spec.tile.id}
            tile={spec.tile}
            onClick={() => onTileClick(spec.tile)}
            gridColumn={spec.gridColumn}
            gridRow={spec.gridRow}
            unified
            className="z-[1]"
          />
        ))}
      </div>
    </div>
  )
}
