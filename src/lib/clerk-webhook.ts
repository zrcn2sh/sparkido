import type { SessionWebhookEvent, WebhookEvent } from '@clerk/nextjs/server'
import { msToKstIso } from '@/lib/datetime'
import { tryEarnLoginFuel, tryEarnSignupFuel } from '@/lib/fuel-auth-rewards'
import { recordLoginEvent } from '@/lib/login-events'
import {
  enrichLoginEventBrowserFromClerkSession,
} from '@/lib/login-event-enrich'
import {
  formatBrowserFromClerkActivity,
  parseBrowserFromUserAgent,
} from '@/lib/login-browser'

function sessionActivity(
  data: SessionWebhookEvent['data'],
  httpRequest: SessionWebhookEvent['event_attributes']['http_request'],
) {
  const raw = data as Record<string, unknown>
  const activity = raw.latest_activity ?? raw.latestActivity
  const rawUserAgent =
    httpRequest.user_agent ??
    (httpRequest as { user_agent?: string }).user_agent ??
    null
  const browser =
    formatBrowserFromClerkActivity(activity) ??
    parseBrowserFromUserAgent(rawUserAgent)

  const activityFields =
    activity && typeof activity === 'object'
      ? (activity as Record<string, unknown>)
      : null

  return {
    ipAddress:
      (activityFields?.ip_address as string | undefined) ??
      (activityFields?.ipAddress as string | undefined) ??
      httpRequest.client_ip ??
      null,
    browser,
    userAgent: rawUserAgent,
    city: (activityFields?.city as string | undefined) ?? null,
    country: (activityFields?.country as string | undefined) ?? null,
  }
}

export async function handleClerkWebhookEvent(
  evt: WebhookEvent,
  clerkEventId: string,
): Promise<'handled' | 'ignored'> {
  if (evt.type === 'user.created') {
    const data = evt.data
    await tryEarnSignupFuel(data.id, clerkEventId)
    return 'handled'
  }

  if (evt.type === 'session.created') {
    const data = evt.data
    const activity = sessionActivity(data, evt.event_attributes.http_request)
    const signedInAt = msToKstIso(data.created_at)

    await recordLoginEvent({
      clerkEventId,
      clerkUserId: data.user_id,
      clerkSessionId: data.id,
      eventType: evt.type,
      signedInAt,
      ...activity,
    })

    // KST 1일 1회 — fuel_ledger(login_day) + DB 유니크 인덱스로 제한
    await tryEarnLoginFuel(data.user_id, signedInAt, clerkEventId)

    void enrichLoginEventBrowserFromClerkSession(data.id)

    return 'handled'
  }

  if (evt.type === 'session.ended') {
    const data = evt.data
    const activity = sessionActivity(data, evt.event_attributes.http_request)

    await recordLoginEvent({
      clerkEventId,
      clerkUserId: data.user_id,
      clerkSessionId: data.id,
      eventType: evt.type,
      signedOutAt: msToKstIso(data.updated_at),
      ...activity,
    })

    return 'handled'
  }

  return 'ignored'
}
