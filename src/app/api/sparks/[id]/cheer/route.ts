import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonUnauthorized } from '@/lib/api'
import { cheerSpark } from '@/lib/spark-fuel'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const sparkId = (await context.params).id?.trim()
    if (!sparkId) return jsonError('Spark ID가 올바르지 않습니다.', 400)

    const result = await cheerSpark(sparkId, userId)
    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          code: result.code,
          limit: result.limit,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ cheerCount: result.cheerCount })
  } catch (error) {
    console.error('[POST /api/sparks/[id]/cheer]', error)
    return NextResponse.json({ error: '응원 처리에 실패했습니다.' }, { status: 500 })
  }
}
