import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonUnauthorized } from '@/lib/api'
import { cancelShowTileByOwner } from '@/lib/show-tiles'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const { id } = await context.params
    const result = await cancelShowTileByOwner(id, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[POST /api/show/tiles/[id]/cancel]', error)
    const message =
      error instanceof Error ? error.message : '게시 취소에 실패했습니다.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
