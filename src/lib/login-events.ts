import { createId } from '@/lib/id'
import { getDb } from '@/lib/db'

export type RecordLoginEventInput = {
  clerkEventId: string
  clerkUserId: string
  clerkSessionId?: string | null
  eventType: string
  signedInAt?: string | null
  signedOutAt?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  city?: string | null
  country?: string | null
}

/** Webhook 재전송 시 clerk_event_id UNIQUE로 중복 방지 */
export async function recordLoginEvent(
  input: RecordLoginEventInput,
): Promise<'inserted' | 'duplicate'> {
  const db = await getDb()
  const result = await db
    .prepare(
      `INSERT OR IGNORE INTO login_events (
         id, clerk_event_id, clerk_user_id, clerk_session_id, event_type,
         signed_in_at, signed_out_at, ip_address, user_agent, city, country
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      createId(),
      input.clerkEventId,
      input.clerkUserId,
      input.clerkSessionId ?? null,
      input.eventType,
      input.signedInAt ?? null,
      input.signedOutAt ?? null,
      input.ipAddress ?? null,
      input.userAgent ?? null,
      input.city ?? null,
      input.country ?? null,
    )
    .run()

  const changes =
    typeof result.meta?.changes === 'number' ? result.meta.changes : 0
  return changes > 0 ? 'inserted' : 'duplicate'
}

export type LoginEvent = {
  id: string
  clerkEventId: string
  clerkUserId: string
  clerkSessionId: string | null
  eventType: string
  signedInAt: string | null
  signedOutAt: string | null
  ipAddress: string | null
  userAgent: string | null
  city: string | null
  country: string | null
  createdAt: string
}

type LoginEventRow = {
  id: string
  clerk_event_id: string
  clerk_user_id: string
  clerk_session_id: string | null
  event_type: string
  signed_in_at: string | null
  signed_out_at: string | null
  ip_address: string | null
  user_agent: string | null
  city: string | null
  country: string | null
  created_at: string
}

function mapRow(row: LoginEventRow): LoginEvent {
  return {
    id: row.id,
    clerkEventId: row.clerk_event_id,
    clerkUserId: row.clerk_user_id,
    clerkSessionId: row.clerk_session_id,
    eventType: row.event_type,
    signedInAt: row.signed_in_at,
    signedOutAt: row.signed_out_at,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    city: row.city,
    country: row.country,
    createdAt: row.created_at,
  }
}

export async function listLoginEventsByUserId(
  clerkUserId: string,
  limit = 50,
): Promise<LoginEvent[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT id, clerk_event_id, clerk_user_id, clerk_session_id, event_type,
              signed_in_at, signed_out_at, ip_address, user_agent, city, country, created_at
       FROM login_events
       WHERE clerk_user_id = ?
       ORDER BY COALESCE(signed_in_at, signed_out_at, created_at) DESC
       LIMIT ?`,
    )
    .bind(clerkUserId, limit)
    .all<LoginEventRow>()

  return (results ?? []).map(mapRow)
}
