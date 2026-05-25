'use client'

import { ShowTileCard } from '@/components/show/ShowTileCard'
import {
  SHOW_GRID_COLS,
  SHOW_GRID_GAP_CLASS,
  SHOW_GRID_PAD_CLASS,
  SHOW_GRID_ROWS,
  isShowGridCellOccupied,
} from '@/lib/show-grid'
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

type ShowGridPageProps = {
  page: ShowPage
  onTileClick: (tile: ShowTile) => void
  selectionEnabled?: boolean
  selectedCells?: ShowGridSelectionCell[]
  onToggleCell?: (cell: ShowGridSelectionCell) => void
}

function ShowGridSlot({
  pageIndex,
  col,
  row,
  occupied,
  selected,
  selectionEnabled,
  onToggle,
}: {
  pageIndex: number
  col: number
  row: number
  occupied: boolean
  selected: boolean
  selectionEnabled: boolean
  onToggle?: () => void
}) {
  const base =
    'aspect-square w-full min-h-0 min-w-0 rounded-sm border border-border/70 bg-background'

  if (occupied) {
    return (
      <div
        className={base}
        style={{ gridColumn: col + 1, gridRow: row + 1 }}
        aria-hidden
      />
    )
  }

  if (selectionEnabled && onToggle) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          base,
          'cursor-pointer transition-colors',
          selected
            ? 'border-primary bg-primary/20 ring-2 ring-primary/50'
            : 'hover:bg-muted/40',
        )}
        style={{ gridColumn: col + 1, gridRow: row + 1 }}
        aria-label={`P${pageIndex + 1} ${col + 1}행 ${row + 1}열`}
        aria-pressed={selected}
      />
    )
  }

  return (
    <div
      className={base}
      style={{ gridColumn: col + 1, gridRow: row + 1 }}
      aria-hidden
    />
  )
}

export function ShowGridPage({
  page,
  onTileClick,
  selectionEnabled = false,
  selectedCells = [],
  onToggleCell,
}: ShowGridPageProps) {
  const slots = []
  for (let row = 0; row < SHOW_GRID_ROWS; row++) {
    for (let col = 0; col < SHOW_GRID_COLS; col++) {
      const occupied = isShowGridCellOccupied(page.tiles, col, row)
      slots.push(
        <ShowGridSlot
          key={`slot-${page.pageIndex}-${col}-${row}`}
          pageIndex={page.pageIndex}
          col={col}
          row={row}
          occupied={occupied}
          selected={isCellSelected(selectedCells, page.pageIndex, col, row)}
          selectionEnabled={selectionEnabled && !occupied}
          onToggle={
            onToggleCell
              ? () =>
                  onToggleCell({ pageIndex: page.pageIndex, col, row })
              : undefined
          }
        />,
      )
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col',
        SHOW_GRID_PAD_CLASS,
      )}
    >
      <div className="shrink-0 py-2 text-center text-xs font-medium text-muted-foreground">
        P{page.pageIndex + 1}
      </div>
      <div
        className={cn('grid w-full pb-2', SHOW_GRID_GAP_CLASS)}
        style={{
          gridTemplateColumns: `repeat(${SHOW_GRID_COLS}, minmax(0, 1fr))`,
        }}
      >
        {slots}
        {page.tiles.map((tile) => (
          <ShowTileCard
            key={tile.id}
            tile={tile}
            onClick={() => onTileClick(tile)}
            className="z-[1]"
          />
        ))}
      </div>
    </div>
  )
}
