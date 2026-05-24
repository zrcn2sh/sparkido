import { nowKstIso } from '@/lib/datetime'
import { getDb } from '@/lib/db'
import { SHOW_GRID_COLS, SHOW_GRID_ROWS } from '@/lib/show-grid'

/** 사용자 Fuel 획득: Spark · Lab · 응원 · 로그인 · 회원가입 */
export const DEFAULT_FUEL_SETTINGS: Omit<FuelSettings, 'updatedAt' | 'updatedBy'> = {
  fuelSparkCreate: 10,
  fuelLabCreate: 5,
  fuelOnCheer: 1,
  fuelLogin: 1,
  fuelSignup: 10,
  maxCheerPerUserPerSparkDay: 10,
  maxCheerPerUserDay: 30,
  showFuelBase: 10,
  showFuelPerCol: 8,
  showFuelPerRow: 8,
  showTileMaxCols: 4,
  showTileMaxRows: 4,
  /** 알파 기간: Show Fuel 차감 없음, 적립은 유지 */
  isAlphaPeriod: true,
}

export type FuelSettings = {
  fuelSparkCreate: number
  fuelLabCreate: number
  fuelOnCheer: number
  fuelLogin: number
  fuelSignup: number
  maxCheerPerUserPerSparkDay: number
  maxCheerPerUserDay: number
  /** Show 타일 1일 Fuel — base + (가로-1)×perCol + (세로-1)×perRow */
  showFuelBase: number
  showFuelPerCol: number
  showFuelPerRow: number
  /** Show 타일 등록 최대 가로·세로 칸 수 */
  showTileMaxCols: number
  showTileMaxRows: number
  isAlphaPeriod: boolean
  updatedAt: string
  updatedBy: string | null
}

export type FuelSettingsInput = Omit<FuelSettings, 'updatedAt' | 'updatedBy'>

type FuelSettingsRow = {
  id: string
  fuel_meter_max: number
  fuel_spark_create: number | null
  fuel_lab_create: number | null
  fuel_cheer_voltage: number
  fuel_login: number | null
  fuel_signup: number | null
  max_fuel_per_user_per_spark_day: number
  max_fuel_per_user_day: number
  show_fuel_base: number | null
  show_fuel_per_col: number | null
  show_fuel_per_row: number | null
  show_tile_max_cols: number | null
  show_tile_max_rows: number | null
  is_alpha_period: number | null
  updated_at: string
  updated_by: string | null
}

const SELECT_COLS = `id, fuel_meter_max,
  COALESCE(fuel_spark_create, 10) AS fuel_spark_create,
  COALESCE(fuel_lab_create, 5) AS fuel_lab_create,
  fuel_cheer_voltage,
  COALESCE(fuel_login, 1) AS fuel_login,
  COALESCE(fuel_signup, 10) AS fuel_signup,
  max_fuel_per_user_per_spark_day,
  max_fuel_per_user_day,
  COALESCE(show_fuel_base, 10) AS show_fuel_base,
  COALESCE(show_fuel_per_col, 8) AS show_fuel_per_col,
  COALESCE(show_fuel_per_row, 8) AS show_fuel_per_row,
  COALESCE(show_tile_max_cols, 4) AS show_tile_max_cols,
  COALESCE(show_tile_max_rows, 4) AS show_tile_max_rows,
  COALESCE(is_alpha_period, 1) AS is_alpha_period,
  updated_at, updated_by`

function mapRow(row: FuelSettingsRow): FuelSettings {
  return {
    fuelSparkCreate: row.fuel_spark_create ?? 10,
    fuelLabCreate: row.fuel_lab_create ?? 5,
    fuelOnCheer: row.fuel_cheer_voltage,
    fuelLogin: row.fuel_login ?? 1,
    fuelSignup: row.fuel_signup ?? 10,
    maxCheerPerUserPerSparkDay: row.max_fuel_per_user_per_spark_day,
    maxCheerPerUserDay: row.max_fuel_per_user_day,
    showFuelBase: row.show_fuel_base ?? 10,
    showFuelPerCol: row.show_fuel_per_col ?? 8,
    showFuelPerRow: row.show_fuel_per_row ?? 8,
    showTileMaxCols: row.show_tile_max_cols ?? 4,
    showTileMaxRows: row.show_tile_max_rows ?? 4,
    isAlphaPeriod: (row.is_alpha_period ?? 1) !== 0,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
}

function rowFromInput(
  input: FuelSettingsInput,
  updatedBy: string | null,
  updatedAt: string,
) {
  return {
    id: 'default',
    fuel_meter_max: 100,
    fuel_spark_create: input.fuelSparkCreate,
    fuel_lab_create: input.fuelLabCreate,
    fuel_cheer_voltage: input.fuelOnCheer,
    fuel_login: input.fuelLogin,
    fuel_signup: input.fuelSignup,
    max_fuel_per_user_per_spark_day: input.maxCheerPerUserPerSparkDay,
    max_fuel_per_user_day: input.maxCheerPerUserDay,
    show_fuel_base: input.showFuelBase,
    show_fuel_per_col: input.showFuelPerCol,
    show_fuel_per_row: input.showFuelPerRow,
    show_tile_max_cols: input.showTileMaxCols,
    show_tile_max_rows: input.showTileMaxRows,
    is_alpha_period: input.isAlphaPeriod ? 1 : 0,
    updated_at: updatedAt,
    updated_by: updatedBy,
  }
}

async function seedDefaultFuelSettings(): Promise<FuelSettings> {
  const db = await getDb()
  const now = nowKstIso()
  const d = DEFAULT_FUEL_SETTINGS
  await db
    .prepare(
      `INSERT OR IGNORE INTO point_settings (
         id, fuel_meter_max, fuel_spark_create, fuel_lab_create, fuel_cheer_voltage,
         fuel_login, fuel_signup,
         fuel_tech_voltage, fuel_market_voltage,
         max_fuel_per_user_per_spark_day, max_fuel_per_user_day,
         show_fuel_base, show_fuel_per_col, show_fuel_per_row,
         show_tile_max_cols, show_tile_max_rows, is_alpha_period,
         top_contributor_min_labs, top_contributor_display_count, updated_at, updated_by
       ) VALUES ('default', ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, 2, 3, ?, NULL)`,
    )
    .bind(
      100,
      d.fuelSparkCreate,
      d.fuelLabCreate,
      d.fuelOnCheer,
      d.fuelLogin,
      d.fuelSignup,
      d.maxCheerPerUserPerSparkDay,
      d.maxCheerPerUserDay,
      d.showFuelBase,
      d.showFuelPerCol,
      d.showFuelPerRow,
      d.showTileMaxCols,
      d.showTileMaxRows,
      d.isAlphaPeriod ? 1 : 0,
      now,
    )
    .run()

  return getFuelSettings()
}

export async function getFuelSettings(): Promise<FuelSettings> {
  const db = await getDb()
  const row = await db
    .prepare(`SELECT ${SELECT_COLS} FROM point_settings WHERE id = 'default'`)
    .first<FuelSettingsRow>()

  if (!row) return seedDefaultFuelSettings()
  return mapRow(row)
}

export function validateFuelSettingsInput(
  input: unknown,
): { ok: true; value: FuelSettingsInput } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: '설정 데이터가 올바르지 않습니다.' }
  }
  const raw = input as Record<string, unknown>

  const nums: { key: keyof FuelSettingsInput; label: string; min: number }[] = [
    { key: 'fuelSparkCreate', label: 'Spark 작성 Fuel', min: 0 },
    { key: 'fuelLabCreate', label: 'Lab 작성 Fuel', min: 0 },
    { key: 'fuelOnCheer', label: '응원하기 Fuel', min: 0 },
    { key: 'fuelLogin', label: '로그인 Fuel (1일 1회)', min: 0 },
    { key: 'fuelSignup', label: '회원가입 Fuel (1회)', min: 0 },
    {
      key: 'maxCheerPerUserPerSparkDay',
      label: '응원하기 Spark당 일 최대횟수',
      min: 0,
    },
    { key: 'maxCheerPerUserDay', label: '사용자·일일 응원 한도', min: 0 },
    { key: 'showFuelBase', label: 'Show 타일 기본 Fuel', min: 0 },
    { key: 'showFuelPerCol', label: 'Show 가로 추가 Fuel', min: 0 },
    { key: 'showFuelPerRow', label: 'Show 세로 추가 Fuel', min: 0 },
    { key: 'showTileMaxCols', label: 'Show 최대 가로 칸', min: 1 },
    { key: 'showTileMaxRows', label: 'Show 최대 세로 칸', min: 1 },
  ]

  const value = {} as FuelSettingsInput
  for (const { key, label, min } of nums) {
    const n = Number(raw[key])
    if (!Number.isFinite(n) || n < min) {
      return {
        ok: false,
        error: `${label}은 ${min} 이상이어야 합니다.`,
      }
    }
    value[key] = Math.floor(n) as never
  }

  if (value.showTileMaxCols > SHOW_GRID_COLS) {
    return {
      ok: false,
      error: `Show 최대 가로 칸은 페이지 그리드(${SHOW_GRID_COLS}칸) 이하여야 합니다.`,
    }
  }
  if (value.showTileMaxRows > SHOW_GRID_ROWS) {
    return {
      ok: false,
      error: `Show 최대 세로 칸은 페이지 그리드(${SHOW_GRID_ROWS}칸) 이하여야 합니다.`,
    }
  }

  value.isAlphaPeriod =
    raw.isAlphaPeriod === true ||
    raw.isAlphaPeriod === 1 ||
    raw.isAlphaPeriod === '1' ||
    raw.isAlphaPeriod === 'true'

  return { ok: true, value }
}

export async function updateFuelSettings(
  input: FuelSettingsInput,
  updatedBy: string,
): Promise<FuelSettings> {
  const db = await getDb()
  const now = nowKstIso()
  const row = rowFromInput(input, updatedBy, now)

  await db
    .prepare(
      `INSERT INTO point_settings (
         id, fuel_meter_max, fuel_spark_create, fuel_lab_create, fuel_cheer_voltage,
         fuel_login, fuel_signup,
         fuel_tech_voltage, fuel_market_voltage,
         max_fuel_per_user_per_spark_day, max_fuel_per_user_day,
         show_fuel_base, show_fuel_per_col, show_fuel_per_row,
         show_tile_max_cols, show_tile_max_rows, is_alpha_period,
         top_contributor_min_labs, top_contributor_display_count, updated_at, updated_by
       ) VALUES ('default', ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, 2, 3, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         fuel_meter_max = excluded.fuel_meter_max,
         fuel_spark_create = excluded.fuel_spark_create,
         fuel_lab_create = excluded.fuel_lab_create,
         fuel_cheer_voltage = excluded.fuel_cheer_voltage,
         fuel_login = excluded.fuel_login,
         fuel_signup = excluded.fuel_signup,
         max_fuel_per_user_per_spark_day = excluded.max_fuel_per_user_per_spark_day,
         max_fuel_per_user_day = excluded.max_fuel_per_user_day,
         show_fuel_base = excluded.show_fuel_base,
         show_fuel_per_col = excluded.show_fuel_per_col,
         show_fuel_per_row = excluded.show_fuel_per_row,
         show_tile_max_cols = excluded.show_tile_max_cols,
         show_tile_max_rows = excluded.show_tile_max_rows,
         is_alpha_period = excluded.is_alpha_period,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(
      row.fuel_meter_max,
      row.fuel_spark_create,
      row.fuel_lab_create,
      row.fuel_cheer_voltage,
      row.fuel_login,
      row.fuel_signup,
      row.max_fuel_per_user_per_spark_day,
      row.max_fuel_per_user_day,
      row.show_fuel_base,
      row.show_fuel_per_col,
      row.show_fuel_per_row,
      row.show_tile_max_cols,
      row.show_tile_max_rows,
      row.is_alpha_period,
      row.updated_at,
      row.updated_by,
    )
    .run()

  return getFuelSettings()
}

export async function getIsAlphaPeriod(): Promise<boolean> {
  return (await getFuelSettings()).isAlphaPeriod
}
