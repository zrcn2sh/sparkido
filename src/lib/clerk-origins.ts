/** 프로덕션 서브도메인 (Build env 누락 시에도 authorizedParties에 포함) */
const PRODUCTION_IDOSQUARE_ORIGINS = [
  'https://www.idosquare.co.kr',
  'https://spark.idosquare.co.kr',
  'https://show.idosquare.co.kr',
  'https://info.idosquare.co.kr',
  'https://board.idosquare.co.kr',
  'https://admin.idosquare.co.kr',
] as const

/** ClerkProvider·미들웨어용 허용 오리진 (서브도메인) */
export function getClerkAllowedOrigins(): string[] {
  const fromList = process.env.NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS?.trim()
  if (fromList) {
    return fromList
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean)
  }

  const urls = [
    process.env.NEXT_PUBLIC_WWW_URL,
    process.env.NEXT_PUBLIC_SPARK_URL,
    process.env.NEXT_PUBLIC_SHOW_URL,
    process.env.NEXT_PUBLIC_INFO_URL,
    process.env.NEXT_PUBLIC_BOARD_URL,
    process.env.NEXT_PUBLIC_ADMIN_URL,
  ]

  const fromEnv = urls
    .map((u) => u?.trim().replace(/\/$/, ''))
    .filter((u): u is string => Boolean(u && /^https?:\/\//.test(u)))

  const localDefaults =
    process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          'http://spark.localhost:3000',
          'http://show.localhost:3000',
          'http://info.localhost:3000',
          'http://board.localhost:3000',
          'http://admin.localhost:3000',
          'http://www.localhost:3000',
        ]
      : []

  return [
    ...new Set([
      ...PRODUCTION_IDOSQUARE_ORIGINS,
      ...fromEnv,
      ...localDefaults,
    ]),
  ]
}

/** clerkMiddleware authorizedParties — 서브도메인 세션 검증 */
export function getClerkAuthorizedParties(): string[] {
  return getClerkAllowedOrigins()
}

/** 현재 요청 호스트를 authorizedParties에 포함 (env 누락 시 403 방지) */
export function withRequestAuthorizedParty(
  parties: string[],
  host: string,
  protocol = 'https',
): string[] {
  if (!host) return parties
  const origin = `${protocol}://${host}`
  if (parties.includes(origin)) return parties
  return [...parties, origin]
}
