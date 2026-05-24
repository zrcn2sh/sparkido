import { clerkClient } from '@clerk/nextjs/server'
import {
  isAnchorExpired,
  parseSessionAnchorCookie,
} from '@/lib/session-anchor'

export function isSessionExpiredByAnchor(
  sessionId: string | null | undefined,
  anchorCookieValue: string | undefined,
): { expired: boolean; anchorUnix: number; needsSetCookie: boolean } {
  const now = Math.floor(Date.now() / 1000)

  if (!sessionId) {
    return { expired: false, anchorUnix: now, needsSetCookie: false }
  }

  const parsed = parseSessionAnchorCookie(anchorCookieValue, sessionId)
  if (parsed == null) {
    return { expired: false, anchorUnix: now, needsSetCookie: true }
  }

  return {
    expired: isAnchorExpired(parsed, now),
    anchorUnix: parsed,
    needsSetCookie: false,
  }
}

export async function revokeSessionIfPresent(
  sessionId: string | null | undefined,
): Promise<void> {
  if (!sessionId) return
  try {
    const client = await clerkClient()
    await client.sessions.revokeSession(sessionId)
  } catch (error) {
    console.error('[session-timeout] revokeSession', error)
  }
}
