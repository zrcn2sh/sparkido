export const runtime = 'edge'

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonUnauthorized } from '@/lib/api'
import { getShowTileCancelQuote } from '@/lib/show-tiles'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const { id } = await context.params
    const quote = await getShowTileCancelQuote(id, userId)
    return NextResponse.json({ quote })
  } catch (error) {
    console.error('[GET /api/show/tiles/[id]/cancel-quote]', error)
    const message =
      error instanceof Error ? error.message : '환불 견적을 불러오지 못했습니다.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
