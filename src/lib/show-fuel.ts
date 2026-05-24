import { getShowRemainingDaysInMonthKst } from '@/lib/datetime'
import { getFuelSettings, type FuelSettings } from '@/lib/fuel-settings'
import type {
  ShowFuelRates,
  ShowPublicConfig,
  ShowTileSizeLimits,
} from '@/lib/show-config'

export type {
  ShowFuelRates,
  ShowPublicConfig,
  ShowSelectionFuelQuote,
  ShowTileSizeLimits,
} from '@/lib/show-config'

export { calcShowTileFuelCost, quoteShowSelectionFuel } from '@/lib/show-config'

export function showFuelRatesFromSettings(settings: FuelSettings): ShowFuelRates {
  return {
    base: settings.showFuelBase,
    perCol: settings.showFuelPerCol,
    perRow: settings.showFuelPerRow,
  }
}

export function showTileSizeLimitsFromSettings(
  settings: FuelSettings,
): ShowTileSizeLimits {
  return {
    maxCols: settings.showTileMaxCols,
    maxRows: settings.showTileMaxRows,
  }
}

export function showPublicConfigFromSettings(
  settings: FuelSettings,
  at: Date = new Date(),
): ShowPublicConfig {
  return {
    rates: showFuelRatesFromSettings(settings),
    sizeLimits: showTileSizeLimitsFromSettings(settings),
    remainingDaysInMonth: getShowRemainingDaysInMonthKst(at),
    isAlphaPeriod: settings.isAlphaPeriod,
  }
}

export async function getShowPublicConfig(): Promise<ShowPublicConfig> {
  const settings = await getFuelSettings()
  return showPublicConfigFromSettings(settings)
}

export async function getShowFuelRates(): Promise<ShowFuelRates> {
  const { rates } = await getShowPublicConfig()
  return rates
}

export async function getShowTileSizeLimits(): Promise<ShowTileSizeLimits> {
  const { sizeLimits } = await getShowPublicConfig()
  return sizeLimits
}
