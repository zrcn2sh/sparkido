import type { ShowPage } from '@/types/show'

/** 데스크톱(sm 이상) 한 화면에 동시에 보이는 페이지 수 */
export const SHOW_VISIBLE_PAGE_COUNT = 3

/** 모바일(sm 미만) 한 화면에 보이는 페이지 수 */
export const SHOW_VISIBLE_PAGE_COUNT_MOBILE = 1

/**
 * P1~P3 → P2~P4 → P3~P1 … 순환 윈도우
 * 페이지가 3개 이하면 한 슬라이드에 전부 표시
 */
export function buildShowPageWindows(
  pages: ShowPage[],
  windowSize = SHOW_VISIBLE_PAGE_COUNT,
): ShowPage[][] {
  const n = pages.length
  if (n === 0) return []

  if (n <= windowSize) {
    return [pages]
  }

  const windows: ShowPage[][] = []
  for (let start = 0; start < n; start++) {
    windows.push(
      Array.from({ length: windowSize }, (_, i) => pages[(start + i) % n]!),
    )
  }
  return windows
}

/** 슬라이드 라벨 (예: P1 · P2 · P3) */
export function formatShowWindowLabel(window: ShowPage[]): string {
  return window.map((p) => `P${p.pageIndex + 1}`).join(' · ')
}
