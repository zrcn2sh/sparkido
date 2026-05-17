import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonForbidden, jsonUnauthorized } from '@/lib/api'
import {
  canSetSparkVisibility,
  sanitizeSparkForViewer,
} from '@/lib/spark-permissions'
import {
  applySparkUpdateInput,
  getSparkById,
  updateSpark,
} from '@/lib/sparks'

type RouteContext = { params: { id: string } }

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth()
    const spark = await getSparkById(params.id)
    if (!spark) {
      return NextResponse.json(
        { error: 'Spark를 찾을 수 없습니다.' },
        { status: 404 },
      )
    }
    return NextResponse.json({
      spark: sanitizeSparkForViewer(spark, userId),
    })
  } catch (error) {
    console.error('[GET /api/sparks/[id]]', error)
    return NextResponse.json(
      { error: 'Spark 조회에 실패했습니다.' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return jsonUnauthorized()
    }

    const spark = await getSparkById(params.id)
    if (!spark) {
      return NextResponse.json(
        { error: 'Spark를 찾을 수 없습니다.' },
        { status: 404 },
      )
    }

    if (spark.authorId !== userId) {
      return jsonForbidden('Spark 작성자만 수정할 수 있습니다.')
    }

    const body = await request.json()
    const input = applySparkUpdateInput(body)

    if (
      input.visibility !== undefined &&
      !canSetSparkVisibility(userId, spark, input.visibility)
    ) {
      return jsonForbidden('공개 설정을 변경할 수 없습니다.')
    }

    const updated = await updateSpark(params.id, userId, input)
    return NextResponse.json({ spark: updated })
  } catch (error) {
    console.error('[PATCH /api/sparks/[id]]', error)
    const message =
      error instanceof Error ? error.message : 'Spark 수정에 실패했습니다.'
    const status = message.includes('찾을 수 없') ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
