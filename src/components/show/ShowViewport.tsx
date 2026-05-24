'use client'

import { ShowGridPage } from '@/components/show/ShowGridPage'
import { ShowTripletGrid } from '@/components/show/ShowTripletGrid'
import { ShowTileModal } from '@/components/show/ShowTileModal'
import { useShowVisiblePageCount } from '@/hooks/use-show-visible-page-count'
import {
  buildShowPageWindows,
  formatShowWindowLabel,
} from '@/lib/show-carousel'
import { cn } from '@/lib/utils'
import type { ShowGridSelectionCell } from '@/lib/show-selection'
import type { ShowPage, ShowTile } from '@/types/show'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type WheelEvent,
} from 'react'

const AUTO_INTERVAL_MS = 15_000

type ShowViewportProps = {
  pages: ShowPage[]
  host: string
  selectionEnabled?: boolean
  selectedCells?: ShowGridSelectionCell[]
  onToggleCell?: (cell: ShowGridSelectionCell) => void
}

export function ShowViewport({
  pages,
  host,
  selectionEnabled = false,
  selectedCells = [],
  onToggleCell,
}: ShowViewportProps) {
  const visiblePageCount = useShowVisiblePageCount()
  const windows = useMemo(
    () => buildShowPageWindows(pages, visiblePageCount),
    [pages, visiblePageCount],
  )
  const [windowIndex, setWindowIndex] = useState(0)
  const [selectedTile, setSelectedTile] = useState<ShowTile | null>(null)
  const [paused, setPaused] = useState(false)
  const focusedPageRef = useRef(0)
  const prevVisiblePageCount = useRef(visiblePageCount)

  const slideCount = windows.length
  const canSlide = slideCount > 1
  const singlePageView = visiblePageCount === 1

  const goToWindow = useCallback(
    (index: number) => {
      if (slideCount === 0) return
      const next = ((index % slideCount) + slideCount) % slideCount
      setWindowIndex(next)
    },
    [slideCount],
  )

  useEffect(() => {
    const w = windows[windowIndex]
    if (w?.[0]) focusedPageRef.current = w[0].pageIndex
  }, [windowIndex, windows])

  useEffect(() => {
    if (prevVisiblePageCount.current === visiblePageCount) return
    prevVisiblePageCount.current = visiblePageCount
    const idx = windows.findIndex(
      (w) => w[0]?.pageIndex === focusedPageRef.current,
    )
    setWindowIndex(idx >= 0 ? idx : 0)
  }, [visiblePageCount, windows])

  useEffect(() => {
    setWindowIndex(0)
  }, [pages.length])

  useEffect(() => {
    if (paused || !canSlide) return
    const id = window.setInterval(() => {
      goToWindow(windowIndex + 1)
    }, AUTO_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [windowIndex, paused, canSlide, goToWindow])

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (!canSlide || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    e.preventDefault()
    if (e.deltaY > 0) goToWindow(windowIndex + 1)
    else goToWindow(windowIndex - 1)
  }

  if (slideCount === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        표시할 페이지가 없습니다.
      </p>
    )
  }

  const currentWindow = windows[windowIndex]!

  return (
    <div
      className="flex flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden" onWheel={onWheel}>
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${slideCount * 100}%`,
            transform: `translateX(-${(windowIndex / slideCount) * 100}%)`,
          }}
        >
          {windows.map((triplet, wi) => (
            <div
              key={`window-${wi}-${triplet.map((p) => p.pageIndex).join('-')}`}
              className="min-w-0 shrink-0"
              style={{ width: `${100 / slideCount}%` }}
              aria-label={formatShowWindowLabel(triplet)}
            >
              {singlePageView ? (
                <ShowGridPage
                  page={triplet[0]!}
                  onTileClick={setSelectedTile}
                  selectionEnabled={selectionEnabled}
                  selectedCells={selectedCells}
                  onToggleCell={onToggleCell}
                />
              ) : (
                <ShowTripletGrid
                  pages={triplet}
                  onTileClick={setSelectedTile}
                  selectionEnabled={selectionEnabled}
                  selectedCells={selectedCells}
                  onToggleCell={onToggleCell}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {canSlide && (
        <div className="mt-3 flex shrink-0 items-center justify-between gap-4 border-t border-[#E8E6DF] px-2 py-3 sm:px-4">
          <button
            type="button"
            onClick={() => goToWindow(windowIndex - 1)}
            className="inline-flex shrink-0 rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted/50"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="flex min-w-0 flex-col items-center gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              {formatShowWindowLabel(currentWindow)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {windows.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToWindow(i)}
                  className={cn(
                    'size-2 rounded-full transition-colors',
                    i === windowIndex
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50',
                  )}
                  aria-label={`${formatShowWindowLabel(windows[i]!)} 보기`}
                  aria-current={i === windowIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => goToWindow(windowIndex + 1)}
            className="inline-flex shrink-0 rounded-full border border-border bg-background p-2 shadow-sm transition-colors hover:bg-muted/50"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}

      <ShowTileModal
        tile={selectedTile}
        host={host}
        onClose={() => setSelectedTile(null)}
        onCanceled={() => setSelectedTile(null)}
      />
    </div>
  )
}
