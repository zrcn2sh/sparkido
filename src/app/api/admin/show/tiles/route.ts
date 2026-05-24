export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { requireAdminUserId } from '@/lib/admin-auth'
import { purgeAllShowTiles } from '@/lib/show-tiles'

/** 관리자: Show 활성 타일 전체 삭제 */
export async function DELETE() {
  try {
    const admin = await requireAdminUserId()
    if (!admin.ok) return admin.response

    const removed = await purgeAllShowTiles({
      actorType: 'admin',
      actorUserId: admin.userId,
      meta: { source: 'admin_manual' },
    })
    return NextResponse.json({ ok: true, removed })
  } catch (error) {
    console.error('[DELETE /api/admin/show/tiles]', error)
    return NextResponse.json(
      { error: '타일 전체 삭제에 실패했습니다.' },
      { status: 500 },
    )
  }
}
