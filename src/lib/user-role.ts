import { getUserProfile } from '@/lib/user-profile'
import type { UserRole } from '@/types'

export type { UserRole } from '@/types'

/**
 * 관리자 지정 — 설정 UI 추후 개발.
 * 현재: CLERK_ADMIN_USER_IDS 환경 변수 또는 D1 user_profiles.role = 'admin'
 */

const ADMIN_IDS = () =>
  new Set(
    (process.env.CLERK_ADMIN_USER_IDS ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  )

export function isAdminUserId(userId: string): boolean {
  return ADMIN_IDS().has(userId)
}

export async function getUserRole(userId: string): Promise<UserRole> {
  if (isAdminUserId(userId)) return 'admin'

  const profile = await getUserProfile(userId)
  if (profile?.role === 'admin') return 'admin'
  return 'member'
}

export async function isAdmin(userId: string): Promise<boolean> {
  return (await getUserRole(userId)) === 'admin'
}

export { getRoleLabel, USER_ROLE_LABELS } from '@/lib/role-labels'
