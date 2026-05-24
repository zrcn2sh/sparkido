import { clerkClient } from '@clerk/nextjs/server'
import { msToKstIso } from '@/lib/datetime'
import { fetchBrowsersBySessionIds } from '@/lib/login-event-enrich'
import {
  formatBrowserFromClerkActivity,
  resolveLoginEventBrowser,
} from '@/lib/login-browser'
import { listLoginEventsByUserId, type LoginEvent } from '@/lib/login-events'

export type AdminLoginHistoryEntry = {
  id: string
  source: 'd1' | 'clerk'
  kind: 'sign_in' | 'sign_out' | 'session'
  eventType: string
  label: string
  occurredAt: string
  signedOutAt: string | null
  ipAddress: string | null
  browser: string | null
  userAgent: string | null
  location: string | null
  clerkSessionId: string | null
}

export type AdminLoginHistoryResult = {
  entries: AdminLoginHistoryEntry[]
  /** 목록 출처 — D1에 없을 때만 Clerk 보조 */
  dataSource: 'd1' | 'clerk'
  lastSignInAt: string | null
}

function formatLocation(city: string | null, country: string | null): string | null {
  const parts = [city, country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

function mapD1Event(event: LoginEvent): AdminLoginHistoryEntry {
  const isSignOut = event.eventType === 'session.ended'
  return {
    id: event.id,
    source: 'd1',
    kind: isSignOut ? 'sign_out' : 'sign_in',
    eventType: event.eventType,
    label: isSignOut ? '로그아웃' : '로그인',
    occurredAt: isSignOut
      ? (event.signedOutAt ?? event.createdAt)
      : (event.signedInAt ?? event.createdAt),
    signedOutAt: event.signedOutAt,
    ipAddress: event.ipAddress,
    browser: resolveLoginEventBrowser(event.browser, event.userAgent),
    userAgent: event.userAgent,
    location: formatLocation(event.city, event.country),
    clerkSessionId: event.clerkSessionId,
  }
}

const SESSION_STATUS_LABELS: Record<string, string> = {
  active: '활성 세션',
  ended: '종료(로그아웃)',
  expired: '만료',
  revoked: '강제 종료',
  removed: '제거됨',
  replaced: '교체됨',
  abandoned: '중단',
  pending: '대기',
}

function sessionStatusLabel(status: string): string {
  return SESSION_STATUS_LABELS[status] ?? status
}

function toMs(value: Date | number | null | undefined): number | null {
  if (value == null) return null
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return null
}

async function fetchClerkLoginHistory(
  clerkUserId: string,
  limit: number,
): Promise<AdminLoginHistoryResult> {
  const client = await clerkClient()
  let lastSignInAt: string | null = null

  try {
    const user = await client.users.getUser(clerkUserId)
    const ms = toMs(user.lastSignInAt)
    if (ms != null) lastSignInAt = msToKstIso(ms)
  } catch {
    /* ignore */
  }

  const response = await client.sessions.getSessionList({
    userId: clerkUserId,
    limit: Math.min(limit, 100),
  })

  const sessions = response.data ?? []
  const entries: AdminLoginHistoryEntry[] = await Promise.all(
    sessions.map(async (session) => {
      const createdMs = toMs(session.createdAt) ?? Date.now()
      const updatedMs = toMs(session.updatedAt)
      const endedStatuses = new Set([
        'ended',
        'expired',
        'revoked',
        'removed',
        'replaced',
      ])
      const signedOutAt =
        updatedMs != null && endedStatuses.has(session.status)
          ? msToKstIso(updatedMs)
          : null

      let browser: string | null = null
      try {
        const detail = await client.sessions.getSession(session.id)
        const activity = (
          detail as {
            latest_activity?: {
              browser_name?: string | null
              browser_version?: string | null
            }
          }
        ).latest_activity
        browser = formatBrowserFromClerkActivity(activity)
      } catch {
        /* 세션 상세 없음 */
      }

      return {
        id: session.id,
        source: 'clerk' as const,
        kind: 'session' as const,
        eventType: `session.${session.status}`,
        label: sessionStatusLabel(session.status),
        occurredAt: msToKstIso(createdMs),
        signedOutAt,
        ipAddress: null,
        browser,
        userAgent: null,
        location: null,
        clerkSessionId: session.id,
      }
    }),
  )

  entries.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )

  return {
    entries,
    dataSource: 'clerk',
    lastSignInAt,
  }
}

export async function getAdminLoginHistory(
  clerkUserId: string,
  limit = 50,
): Promise<AdminLoginHistoryResult> {
  const d1Events = await listLoginEventsByUserId(clerkUserId, limit)

  if (d1Events.length > 0) {
    const missingSessionIds = d1Events
      .filter((e) => !resolveLoginEventBrowser(e.browser, e.userAgent) && e.clerkSessionId)
      .map((e) => e.clerkSessionId as string)
    const browsersBySession = await fetchBrowsersBySessionIds(missingSessionIds)

    return {
      entries: d1Events.map((event) => {
        const entry = mapD1Event(event)
        if (entry.browser || !event.clerkSessionId) return entry
        const fromClerk = browsersBySession.get(event.clerkSessionId)
        if (!fromClerk) return entry
        return { ...entry, browser: fromClerk }
      }),
      dataSource: 'd1',
      lastSignInAt: null,
    }
  }

  return fetchClerkLoginHistory(clerkUserId, limit)
}
