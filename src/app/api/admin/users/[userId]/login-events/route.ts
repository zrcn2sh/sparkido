import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireAdminUserId } from '@/lib/admin-auth'
import { getAdminLoginHistory } from '@/lib/admin-login-history'

type RouteContext = { params: { userId: string } }

export async function GET(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminUserId()
    if (!admin.ok) return admin.response

    const targetUserId = context.params.userId?.trim()
    if (!targetUserId) {
      return jsonError('회원 ID가 올바르지 않습니다.', 400)
    }

    const { searchParams } = new URL(request.url)
    const limitRaw = Number(searchParams.get('limit') ?? '50')
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0
        ? Math.min(Math.floor(limitRaw), 100)
        : 50

    const history = await getAdminLoginHistory(targetUserId, limit)
    return NextResponse.json(history)
  } catch (error) {
    console.error('[GET /api/admin/users/[userId]/login-events]', error)
    return NextResponse.json(
      { error: '로그인 이력을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}
