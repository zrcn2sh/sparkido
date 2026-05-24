import { auth } from '@clerk/nextjs/server'
import { jsonForbidden, jsonUnauthorized } from '@/lib/api'
import { isAdmin } from '@/lib/user-role'

export async function requireAdminUserId(): Promise<
  { ok: true; userId: string } | { ok: false; response: Response }
> {
  const { userId } = await auth()
  if (!userId) {
    return { ok: false, response: jsonUnauthorized() }
  }
  if (!(await isAdmin(userId))) {
    return {
      ok: false,
      response: jsonForbidden('관리자만 접근할 수 있습니다.'),
    }
  }
  return { ok: true, userId }
}
