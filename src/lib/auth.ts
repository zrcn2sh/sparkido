import { auth, currentUser } from '@clerk/nextjs/server'

export type SessionUser = {
  id: string
  email: string
  name: string | null
}

export async function getSession(): Promise<SessionUser | null> {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  return {
    id: userId,
    email: user?.emailAddresses[0]?.emailAddress ?? '',
    name: user?.fullName ?? user?.firstName ?? null,
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
