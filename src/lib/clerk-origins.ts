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

  return urls
    .map((u) => u?.trim().replace(/\/$/, ''))
    .filter((u): u is string => Boolean(u && /^https?:\/\//.test(u)))
}
