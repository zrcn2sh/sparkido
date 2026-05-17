import type { SessionWebhookEvent, WebhookEvent } from '@clerk/nextjs/server'
import {
  clerkTimestampToIso,
  recordLoginEvent,
} from '@/lib/login-events'

function sessionActivity(
  data: SessionWebhookEvent['data'],
  httpRequest: SessionWebhookEvent['event_attributes']['http_request'],
) {
  const activity = data.latest_activity
  const browser = activity
    ? [activity.browser_name, activity.browser_version].filter(Boolean).join(' ')
    : ''

  return {
    ipAddress: activity?.ip_address ?? httpRequest.client_ip ?? null,
    userAgent:
      browser ||
      activity?.device_type ||
      httpRequest.user_agent ||
      null,
    city: activity?.city ?? null,
    country: activity?.country ?? null,
  }
}

export async function handleClerkWebhookEvent(
  evt: WebhookEvent,
  clerkEventId: string,
): Promise<'handled' | 'ignored'> {
  if (evt.type === 'session.created') {
    const data = evt.data
    const activity = sessionActivity(data, evt.event_attributes.http_request)

    await recordLoginEvent({
      clerkEventId,
      clerkUserId: data.user_id,
      clerkSessionId: data.id,
      eventType: evt.type,
      signedInAt: clerkTimestampToIso(data.created_at),
      ...activity,
    })

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
      signedOutAt: clerkTimestampToIso(data.updated_at),
      ...activity,
    })

    return 'handled'
  }

  return 'ignored'
}
