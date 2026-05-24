import type { User } from '@clerk/nextjs/server'

/** Clerk 계정 이름(별명 없을 때 화면 표시용) */
export function getClerkUserDisplayName(user: User): string {
  const first = user.firstName?.trim()
  const last = user.lastName?.trim()
  if (first || last) {
    return [first, last].filter(Boolean).join(' ')
  }
  if (user.fullName?.trim()) return user.fullName.trim()
  if (user.username?.trim()) return user.username.trim()
  const email = user.emailAddresses[0]?.emailAddress
  if (email) return email.split('@')[0] ?? email
  return '알 수 없음'
}
