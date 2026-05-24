import type { UserRole } from '@/types'

/** 클라이언트·서버 공용 — DB/Wrangler 의존 없음 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: '관리자',
  member: '회원',
}

export function getRoleLabel(role: UserRole): string {
  return USER_ROLE_LABELS[role]
}
