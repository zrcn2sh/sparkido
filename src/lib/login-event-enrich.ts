import { clerkClient } from '@clerk/nextjs/server'
import { getDb } from '@/lib/db'
import {
  formatBrowserFromClerkActivity,
  parseBrowserFromUserAgent,
} from '@/lib/login-browser'

export async function patchLoginEventBrowserForSession(
  clerkSessionId: string,
  browser: string | null,
  userAgent?: string | null,
): Promise<void> {
  const trimmedBrowser = browser?.trim() || null
  const ua = userAgent?.trim() || null
  if (!trimmedBrowser && !ua) return

  const db = await getDb()
  await db
    .prepare(
      `UPDATE login_events
       SET browser = COALESCE(?, browser),
           user_agent = COALESCE(?, user_agent)
       WHERE clerk_session_id = ?
         AND event_type = 'session.created'`,
    )
    .bind(trimmedBrowser, ua, clerkSessionId)
    .run()
}

/** Clerk API 세션 상세에서 latest_activity 브라우저 보강 */
export async function enrichLoginEventBrowserFromClerkSession(
  clerkSessionId: string,
): Promise<void> {
  try {
    const client = await clerkClient()
    const session = await client.sessions.getSession(clerkSessionId)
    const raw = session as Record<string, unknown>
    const activity = raw.latest_activity ?? raw.latestActivity
    const browser = formatBrowserFromClerkActivity(activity)
    if (browser) {
      await patchLoginEventBrowserForSession(clerkSessionId, browser)
    }
  } catch (error) {
    console.error('[enrichLoginEventBrowserFromClerkSession]', error)
  }
}

/** 실제 요청 User-Agent로 로그인 이벤트 보강 (Webhook 직후 activity 비어 있을 때) */
export async function enrichLoginEventBrowserFromRequest(
  clerkSessionId: string,
  userAgentHeader: string | null | undefined,
): Promise<void> {
  const ua = userAgentHeader?.trim() || null
  const browser = parseBrowserFromUserAgent(ua)
  if (browser || ua) {
    await patchLoginEventBrowserForSession(clerkSessionId, browser, ua)
  }
  await enrichLoginEventBrowserFromClerkSession(clerkSessionId)
}

const sessionBrowserCache = new Map<string, string | null>()

/** Admin 조회 시 browser 비어 있는 세션을 Clerk에서 일괄 보강 */
export async function fetchBrowsersBySessionIds(
  sessionIds: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  const unique = [...new Set(sessionIds.filter(Boolean))]
  if (unique.length === 0) return result

  const client = await clerkClient()
  await Promise.all(
    unique.map(async (sessionId) => {
      if (sessionBrowserCache.has(sessionId)) {
        const cached = sessionBrowserCache.get(sessionId)
        if (cached) result.set(sessionId, cached)
        return
      }
      try {
        const session = await client.sessions.getSession(sessionId)
        const raw = session as Record<string, unknown>
        const activity = raw.latest_activity ?? raw.latestActivity
        const browser = formatBrowserFromClerkActivity(activity)
        sessionBrowserCache.set(sessionId, browser)
        if (browser) result.set(sessionId, browser)
      } catch {
        sessionBrowserCache.set(sessionId, null)
      }
    }),
  )
  return result
}
