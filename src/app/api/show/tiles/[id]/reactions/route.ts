import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonUnauthorized } from '@/lib/api'
import {
  addShowTileReaction,
  type ShowTileReactionType,
} from '@/lib/show-tile-reactions'

export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ id: string }> }

function parseReactionType(value: unknown): ShowTileReactionType | null {
  if (value === 'tried' || value === 'recommend') return value
  return null
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const { id } = await context.params
    const body = (await request.json()) as { type?: unknown }
    const type = parseReactionType(body.type)
    if (!type) {
      return NextResponse.json(
        { error: 'type은 tried 또는 recommend여야 합니다.' },
        { status: 400 },
      )
    }

    const result = await addShowTileReaction(id, userId, type)
    return NextResponse.json({
      triedCount: result.triedCount,
      recommendCount: result.recommendCount,
      userHasTried: result.hasTried,
      userHasRecommended: result.hasRecommended,
    })
  } catch (error) {
    console.error('[POST /api/show/tiles/[id]/reactions]', error)
    const message =
      error instanceof Error ? error.message : '반응을 저장하지 못했습니다.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
