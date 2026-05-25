'use client'

import { SHOW_CATEGORY_LABELS } from '@/lib/show-labels'
import { cn } from '@/lib/utils'
import type { ShowTile } from '@/types/show'
import { ThumbsUp } from 'lucide-react'

/** 이미지·아이콘 없을 때만 카테고리별 플레이스홀더 */
const TILE_GRADIENT: Record<ShowTile['category'], string> = {
  web: 'from-teal-500/80 to-emerald-700/90',
  app: 'from-stone-400/70 to-stone-600/80',
  api_tool: 'from-violet-500/80 to-indigo-700/90',
  browser_extension: 'from-amber-500/80 to-orange-700/90',
  other: 'from-stone-500/70 to-stone-700/90',
}

type ShowTileCardProps = {
  tile: ShowTile
  onClick: () => void
  className?: string
  /** 통합 그리드(18열) 배치 — P1·P2 연결 시 한 장으로 */
  gridColumn?: string
  gridRow?: string
  unified?: boolean
}

export function ShowTileCard({
  tile,
  onClick,
  className,
  gridColumn,
  gridRow,
  unified = false,
}: ShowTileCardProps) {
  const colSpan = gridColumn?.match(/span\s+(\d+)/)?.[1]
  const rowSpan = gridRow?.match(/span\s+(\d+)/)?.[1]
  const cellCount = unified
    ? Number(colSpan ?? 1) * Number(rowSpan ?? 1)
    : tile.width * tile.height
  const compact = cellCount <= 2
  const hasTileVisual = Boolean(tile.imageUrl || tile.iconText)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative h-full w-full min-h-0 min-w-0 overflow-hidden rounded-sm border border-black/10 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        hasTileVisual
          ? 'bg-background'
          : cn('bg-gradient-to-br', TILE_GRADIENT[tile.category]),
        className,
      )}
      style={{
        gridColumn:
          gridColumn ?? `${tile.col + 1} / span ${tile.width}`,
        gridRow: gridRow ?? `${tile.row + 1} / span ${tile.height}`,
      }}
    >
      {tile.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tile.imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : tile.iconText ? (
        <span
          className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl"
          aria-hidden
        >
          {tile.iconText}
        </span>
      ) : null}
      {hasTileVisual ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/80 via-black/40 to-transparent',
            compact ? 'h-[55%] max-h-14' : 'h-[42%] max-h-28 sm:max-h-32',
          )}
          aria-hidden
        />
      ) : null}
      {tile.recommendCount > 0 && (
        <div
          className={cn(
            'absolute z-[2] flex items-center gap-0.5 rounded-sm bg-black/55 text-white backdrop-blur-sm',
            compact ? 'top-0.5 right-0.5 px-0.5 py-px' : 'top-1 right-1 px-1 py-0.5',
          )}
          aria-label={`추천 ${tile.recommendCount}`}
        >
          <ThumbsUp
            className={cn(
              'shrink-0 fill-current',
              compact ? 'size-2' : 'size-2.5 sm:size-3',
            )}
            aria-hidden
          />
          <span
            className={cn(
              'font-mono font-semibold leading-none tabular-nums',
              compact ? 'text-[7px]' : 'text-[8px] sm:text-[9px]',
            )}
          >
            {tile.recommendCount}
          </span>
        </div>
      )}
      <div
        className={cn(
          'relative z-[2] flex h-full flex-col justify-end',
          compact ? 'p-1' : 'p-1.5 sm:p-2',
        )}
      >
        {!compact && (
          <span className="mb-0.5 w-fit rounded bg-white/15 px-1 py-px text-[8px] font-medium text-white/90 backdrop-blur-sm">
            {SHOW_CATEGORY_LABELS[tile.category]}
          </span>
        )}
        <p
          className={cn(
            'font-semibold leading-tight text-white',
            compact
              ? 'line-clamp-2 text-[9px] sm:text-[10px]'
              : 'line-clamp-2 text-[10px] sm:text-xs',
          )}
        >
          {tile.title}
        </p>
        {!compact && cellCount >= 4 && (
          <p className="mt-0.5 line-clamp-1 text-[8px] text-white/80 sm:text-[9px]">
            {tile.tagline}
          </p>
        )}
      </div>
    </button>
  )
}
