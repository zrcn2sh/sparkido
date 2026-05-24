import { clerkClient } from '@clerk/nextjs/server'
import { nowKstIso } from '@/lib/datetime'
import { getDb } from '@/lib/db'
import { isAdminUserId } from '@/lib/user-role'
import type { UserProfile } from '@/lib/user-profile'
import type { AdminMemberListItem, UserRole } from '@/types'

export type { AdminMemberListItem } from '@/types'

type UserProfileRow = {
  clerk_user_id: string
  nickname: string
  role: UserRole
  created_at: string
  updated_at: string
}

function mapProfileRow(row: UserProfileRow): UserProfile {
  return {
    clerkUserId: row.clerk_user_id,
    nickname: row.nickname,
    role: row.role === 'admin' ? 'admin' : 'member',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listAdminMembers(): Promise<AdminMemberListItem[]> {
  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT clerk_user_id, nickname, role, created_at, updated_at
       FROM user_profiles
       ORDER BY created_at DESC`,
    )
    .all<UserProfileRow>()

  const profiles = (results ?? []).map(mapProfileRow)
  const client = await clerkClient()

  const items = await Promise.all(
    profiles.map(async (profile) => {
      let email: string | null = null
      try {
        const user = await client.users.getUser(profile.clerkUserId)
        email = user.emailAddresses[0]?.emailAddress ?? null
      } catch {
        /* Clerk 조회 실패 */
      }

      const roleFromEnv = isAdminUserId(profile.clerkUserId)
      const effectiveRole: UserRole =
        roleFromEnv || profile.role === 'admin' ? 'admin' : 'member'

      return {
        clerkUserId: profile.clerkUserId,
        nickname: profile.nickname,
        role: profile.role,
        effectiveRole,
        roleFromEnv,
        email,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    }),
  )

  return items
}

async function countEffectiveAdmins(
  excludeUserId?: string,
): Promise<number> {
  const ids = new Set<string>()
  const envIds = (process.env.CLERK_ADMIN_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  for (const id of envIds) {
    if (id !== excludeUserId) ids.add(id)
  }

  const db = await getDb()
  const { results } = await db
    .prepare(
      `SELECT clerk_user_id FROM user_profiles WHERE role = 'admin'`,
    )
    .all<{ clerk_user_id: string }>()

  for (const row of results ?? []) {
    if (row.clerk_user_id !== excludeUserId) ids.add(row.clerk_user_id)
  }
  return ids.size
}

export async function updateMemberRole(
  targetUserId: string,
  role: UserRole,
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  if (role !== 'admin' && role !== 'member') {
    return { ok: false, error: '등급이 올바르지 않습니다.' }
  }

  if (role === 'member' && isAdminUserId(targetUserId)) {
    return {
      ok: false,
      error:
        '환경 변수(CLERK_ADMIN_USER_IDS)로 지정된 관리자는 DB에서 회원으로 바꿀 수 없습니다.',
    }
  }

  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT clerk_user_id, nickname, role, created_at, updated_at
       FROM user_profiles WHERE clerk_user_id = ?`,
    )
    .bind(targetUserId)
    .first<UserProfileRow>()

  if (!row) {
    return { ok: false, error: '별명을 등록한 회원만 등급을 변경할 수 있습니다.' }
  }

  const current = mapProfileRow(row)

  if (role === 'member' && current.role === 'admin') {
    const remaining = await countEffectiveAdmins(targetUserId)
    if (remaining === 0) {
      return {
        ok: false,
        error: '관리자가 최소 1명은 있어야 합니다.',
      }
    }
  }

  const now = nowKstIso()
  await db
    .prepare(
      `UPDATE user_profiles SET role = ?, updated_at = ? WHERE clerk_user_id = ?`,
    )
    .bind(role, now, targetUserId)
    .run()

  const profile = await db
    .prepare(
      `SELECT clerk_user_id, nickname, role, created_at, updated_at
       FROM user_profiles WHERE clerk_user_id = ?`,
    )
    .bind(targetUserId)
    .first<UserProfileRow>()

  if (!profile) {
    return { ok: false, error: '등급 저장 후 조회에 실패했습니다.' }
  }

  return { ok: true, profile: mapProfileRow(profile) }
}
