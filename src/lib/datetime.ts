/** 한국 표준시(KST, UTC+9) — DB 저장·화면 표시 공통 */
export const KST_TIMEZONE = 'Asia/Seoul'

export const KST_OFFSET = '+09:00'

type KstParts = {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  second: string
}

function kstPartsFromDate(date: Date): KstParts {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: KST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  }
}

/** DB 저장용 — 예: 2026-05-17T21:05:00+09:00 */
export function nowKstIso(): string {
  return formatKstIso(new Date())
}

export function formatKstIso(date: Date): string {
  const p = kstPartsFromDate(date)
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${KST_OFFSET}`
}

export function msToKstIso(timestampMs: number): string {
  return formatKstIso(new Date(timestampMs))
}

/**
 * DB에서 읽은 시각 문자열 파싱.
 * - +09:00 / Z 등 오프셋 있음 → 그대로
 * - SQLite datetime('now') 등 무오프셋 → UTC로 간주 후 Date 생성
 */
export function parseStoredDate(iso: string): Date {
  const trimmed = iso.trim()
  if (!trimmed) return new Date()

  if (/[zZ]$/.test(trimmed) || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    return new Date(trimmed)
  }

  const normalized = trimmed.includes('T')
    ? trimmed
    : trimmed.replace(' ', 'T')

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
    return new Date(`${normalized}Z`)
  }

  return new Date(normalized)
}

export function formatKstDate(
  iso: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return parseStoredDate(iso).toLocaleDateString('ko-KR', {
    timeZone: KST_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export function formatKstDateTime(iso: string): string {
  return parseStoredDate(iso).toLocaleString('ko-KR', {
    timeZone: KST_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
}

/** KST 달력 기준 연·월·일 (month 1–12) */
export function getKstYmd(at: Date = new Date()): {
  year: number
  month: number
  day: number
} {
  const p = kstPartsFromDate(at)
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
  }
}

/** KST 달력과 동일한 그레고리력 월 일수 (month 1–12) */
export function getDaysInMonthKst(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Show Fuel — 당월 잔여 일수 (등록 당일 포함, KST)
 * 예: 5월 11일 → 5/11~5/31 = 21일
 */
export function getShowRemainingDaysInMonthKst(at: Date = new Date()): number {
  const { year, month, day } = getKstYmd(at)
  const daysInMonth = getDaysInMonthKst(year, month)
  return Math.max(1, daysInMonth - day + 1)
}
