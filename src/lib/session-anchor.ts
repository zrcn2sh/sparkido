import { SESSION_MAX_AGE_SECONDS } from '@/lib/session-config'

/** 로그인 세션 시작 시각 고정(Clerk JWT iat는 갱신될 때마다 바뀜) */
export const SESSION_ANCHOR_COOKIE = 'sparkido_sess_anchor'

export function parseSessionAnchorCookie(
  value: string | undefined,
  sessionId: string,
): number | null {
  if (!value) return null
  const sep = value.indexOf(':')
  if (sep < 0) return null
  const sid = value.slice(0, sep)
  const ts = Number.parseInt(value.slice(sep + 1), 10)
  if (sid !== sessionId || !Number.isFinite(ts)) return null
  return ts
}

export function buildSessionAnchorCookieValue(
  sessionId: string,
  anchorUnix: number,
): string {
  return `${sessionId}:${anchorUnix}`
}

export function isAnchorExpired(anchorUnix: number, nowUnix = Math.floor(Date.now() / 1000)) {
  return nowUnix - anchorUnix > SESSION_MAX_AGE_SECONDS
}

/** 프로덕션 서브도메인 간 동일 앵커 쿠키 공유 (Chrome 병렬·호스트 전환 race 완화) */
export function getSessionAnchorCookieDomain(host: string): string | undefined {
  const bare = host.split(':')[0].toLowerCase()
  if (bare === 'idosquare.co.kr' || bare.endsWith('.idosquare.co.kr')) {
    return '.idosquare.co.kr'
  }
  return undefined
}
