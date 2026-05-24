/** Clerk session.latest_activity 에서 브라우저 표시 문자열 생성 */
export function formatBrowserFromActivity(activity: {
  browser_name?: string | null
  browser_version?: string | null
} | null | undefined): string | null {
  if (!activity?.browser_name?.trim()) return null
  const version = activity.browser_version?.trim()
  return version
    ? `${activity.browser_name.trim()} ${version}`
    : activity.browser_name.trim()
}

/** Webhook/API — snake_case·camelCase 모두 처리 */
export function formatBrowserFromClerkActivity(
  activity: unknown,
): string | null {
  if (!activity || typeof activity !== 'object') return null
  const a = activity as Record<string, unknown>
  const name = String(a.browser_name ?? a.browserName ?? '').trim()
  if (!name) return null
  const version = String(a.browser_version ?? a.browserVersion ?? '').trim()
  return version ? `${name} ${version}` : name
}

/** Webhook에 activity가 없을 때 User-Agent에서 브라우저 이름 추출 */
export function parseBrowserFromUserAgent(
  userAgent: string | null | undefined,
): string | null {
  if (!userAgent?.trim()) return null
  const ua = userAgent

  const edge = ua.match(/\bEdg(?:A|iOS)?\/([\d.]+)/)
  if (edge) return `Edge ${edge[1].split('.')[0]}`

  const opr = ua.match(/\bOPR\/([\d.]+)/)
  if (opr) return `Opera ${opr[1].split('.')[0]}`

  const chrome = ua.match(/\bChrome\/([\d.]+)/)
  if (chrome && !/\bEdg/.test(ua)) return `Chrome ${chrome[1].split('.')[0]}`

  const firefox = ua.match(/\bFirefox\/([\d.]+)/)
  if (firefox) return `Firefox ${firefox[1].split('.')[0]}`

  const safari = ua.match(/\bVersion\/([\d.]+).*Safari/)
  if (safari && /\bSafari/.test(ua) && !/\bChrome/.test(ua)) {
    return `Safari ${safari[1].split('.')[0]}`
  }

  if (/\bsamsungbrowser\//i.test(ua)) {
    const m = ua.match(/samsungbrowser\/([\d.]+)/i)
    return m ? `Samsung Internet ${m[1].split('.')[0]}` : 'Samsung Internet'
  }

  return null
}

/** DB browser 컬럼 도입 전 user_agent에 브라우저만 저장된 레거시 호환 */
export function resolveLoginEventBrowser(
  browser: string | null | undefined,
  userAgent: string | null | undefined,
): string | null {
  if (browser?.trim()) return browser.trim()
  if (!userAgent?.trim()) return null
  const ua = userAgent.trim()
  if (ua.startsWith('Mozilla/') || ua.startsWith('Opera/')) {
    return parseBrowserFromUserAgent(ua)
  }
  return ua
}
