/** 클라이언트·서버 공용 (DB import 없음) */

export type CheerSparkErrorCode =
  | 'spark_daily_cheer_limit'
  | 'user_daily_cheer_limit'

export function cheerSparkDailyLimitMessage(limit: number): string {
  return `응원하기는 일 최대 ${limit}회로 제한됩니다.`
}
