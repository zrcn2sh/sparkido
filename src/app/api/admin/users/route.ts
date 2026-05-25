import { NextResponse } from 'next/server'
import { requireAdminUserId } from '@/lib/admin-auth'
import { listAdminMembers } from '@/lib/admin-users'

export async function GET() {
  try {
    const admin = await requireAdminUserId()
    if (!admin.ok) return admin.response

    const members = await listAdminMembers()
    return NextResponse.json({ members })
  } catch (error) {
    console.error('[GET /api/admin/users]', error)
    return NextResponse.json(
      { error: '회원 목록을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}
