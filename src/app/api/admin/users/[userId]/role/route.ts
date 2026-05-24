export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireAdminUserId } from '@/lib/admin-auth'
import { updateMemberRole } from '@/lib/admin-users'
import { getUserRole, isAdminUserId } from '@/lib/user-role'
import type { UserRole } from '@/types'

type RouteContext = { params: { userId: string } }

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireAdminUserId()
    if (!admin.ok) return admin.response

    const targetUserId = context.params.userId?.trim()
    if (!targetUserId) {
      return jsonError('회원 ID가 올바르지 않습니다.', 400)
    }

    const body = (await request.json()) as { role?: string }
    const role = body.role as UserRole
    if (role !== 'admin' && role !== 'member') {
      return jsonError('등급이 올바르지 않습니다.', 400)
    }

    const result = await updateMemberRole(targetUserId, role)
    if (!result.ok) {
      return jsonError(result.error, 400)
    }

    const effectiveRole = await getUserRole(targetUserId)
    return NextResponse.json({
      profile: result.profile,
      effectiveRole,
      roleFromEnv: isAdminUserId(targetUserId),
    })
  } catch (error) {
    console.error('[PATCH /api/admin/users/[userId]/role]', error)
    return NextResponse.json(
      { error: '등급 변경에 실패했습니다.' },
      { status: 500 },
    )
  }
}
