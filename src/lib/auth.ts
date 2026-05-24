import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { getClerkUserDisplayName } from '@/lib/display-name'
import { getNickname, getNicknamesByUserIds } from '@/lib/user-profile'

export type SessionUser = {
  id: string
  email: string
  name: string | null
}

export async function getSession(): Promise<SessionUser | null> {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const nickname = await getNickname(userId)
  const name = nickname ?? (user ? getClerkUserDisplayName(user) : null)

  return {
    id: userId,
    email: user?.emailAddresses[0]?.emailAddress ?? '',
    name,
  }
}

export async function requireUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('UNAUTHORIZED')
  }
  return userId
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new Error('로그인이 필요합니다.')
  }
  return session
}

/** 화면 표시명 — D1 별명 우선, 없으면 Clerk 이름 */
export async function getUserDisplayName(userId: string): Promise<string> {
  const nickname = await getNickname(userId)
  if (nickname) return nickname

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return getClerkUserDisplayName(user)
  } catch {
    return '알 수 없음'
  }
}

/** 여러 사용자 표시명 (목록용) — 별명 없으면 Clerk 이름 */
export async function getDisplayNamesByUserIds(
  userIds: string[],
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {}

  const nicknames = await getNicknamesByUserIds(userIds)
  const missing = userIds.filter((id) => !nicknames[id])
  if (missing.length === 0) return nicknames

  const result = { ...nicknames }

  try {
    const client = await clerkClient()
    const { data: users } = await client.users.getUserList({
      userId: missing,
      limit: Math.min(missing.length, 100),
    })
    for (const user of users) {
      result[user.id] = getClerkUserDisplayName(user)
    }
  } catch {
    /* Clerk 일괄 조회 실패 */
  }

  for (const id of missing) {
    if (!result[id]) result[id] = '알 수 없음'
  }

  return result
}
