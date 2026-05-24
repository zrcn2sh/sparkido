import { getShowRemainingDaysInMonthKst } from '@/lib/datetime'
import {
  isShowTileSizeAllowed,
  selectionGlobalBounds,
  type ShowGridSelectionCell,
} from '@/lib/show-selection'

export type ShowFuelRates = {
  base: number
  perCol: number
  perRow: number
}

export type ShowTileSizeLimits = {
  maxCols: number
  maxRows: number
}

export type ShowPublicConfig = {
  rates: ShowFuelRates
  sizeLimits: ShowTileSizeLimits
  /** 당월 잔여 일수(KST, 등록 당일 포함) — 견적용 */
  remainingDaysInMonth: number
  /** 알파 기간: Show Fuel 차감 없음 */
  isAlphaPeriod: boolean
}

/** 타일 크기(칸) 기준 1일 Fuel — base + (가로−1)×perCol + (세로−1)×perRow (Admin 1일 단가) */
export function calcShowTileDailyFuel(
  width: number,
  height: number,
  rates: ShowFuelRates,
): number {
  const w = Math.max(1, width)
  const h = Math.max(1, height)
  return rates.base + (w - 1) * rates.perCol + (h - 1) * rates.perRow
}

/** @deprecated calcShowTileDailyFuel 사용 */
export const calcShowTileFuelCost = calcShowTileDailyFuel

export type ShowSelectionFuelQuote = {
  /** 1일 Fuel */
  dailyFuel: number
  /** KST 당월 잔여 일수(등록 당일 포함) */
  remainingDays: number
  /** 당월 청구 = dailyFuel × remainingDays */
  periodFuel: number
  cellCount: number
  width: number
  height: number
}

/** 선택 영역이 유효한 직사각형일 때 배치·Fuel 견적 (클라이언트·서버 공용) */
export function quoteShowSelectionFuel(
  cells: ShowGridSelectionCell[],
  rates: ShowFuelRates,
  sizeLimits: ShowTileSizeLimits,
  remainingDays: number = getShowRemainingDaysInMonthKst(),
): ShowSelectionFuelQuote | null {
  if (cells.length === 0) return null

  const bounds = selectionGlobalBounds(cells)
  if (
    !bounds ||
    !isShowTileSizeAllowed(bounds.width, bounds.height, sizeLimits)
  ) {
    return null
  }

  const { width, height } = bounds
  const dailyFuel = calcShowTileDailyFuel(width, height, rates)
  const days = Math.max(1, remainingDays)

  return {
    dailyFuel,
    remainingDays: days,
    periodFuel: dailyFuel * days,
    cellCount: cells.length,
    width,
    height,
  }
}
