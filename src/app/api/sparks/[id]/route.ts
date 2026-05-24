import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonForbidden, jsonUnauthorized } from '@/lib/api'
import {
  canEditSpark,
  canSetSparkVisibility,
  canDeleteSpark,
  sanitizeSparkForViewer,
} from '@/lib/spark-permissions'
import { isAdmin } from '@/lib/user-role'
import {
  applySparkUpdateInput,
  deleteSpark,
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
    const viewerIsAdmin = userId ? await isAdmin(userId) : false
    return NextResponse.json({
      spark: sanitizeSparkForViewer(spark, userId, { viewerIsAdmin }),
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

    if (!(await canEditSpark(userId, spark))) {
      return jsonForbidden('Spark 수정 권한이 없습니다.')
    }

    const body = await request.json()
    const input = applySparkUpdateInput(body)

    if (
      input.visibility !== undefined &&
      !(await canSetSparkVisibility(userId, spark, input.visibility))
    ) {
      return jsonForbidden('공개 설정을 변경할 수 없습니다.')
    }

    const updated = await updateSpark(params.id, userId, input)
    const viewerIsAdmin = await isAdmin(userId)
    return NextResponse.json({
      spark: sanitizeSparkForViewer(updated, userId, { viewerIsAdmin }),
    })
  } catch (error) {
    console.error('[PATCH /api/sparks/[id]]', error)
    const message =
      error instanceof Error ? error.message : 'Spark 수정에 실패했습니다.'
    const status = message.includes('찾을 수 없') ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    if (!(await canDeleteSpark(userId))) {
      return jsonForbidden('관리자만 Spark를 삭제할 수 있습니다.')
    }

    await deleteSpark(params.id, userId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/sparks/[id]]', error)
    const message =
      error instanceof Error ? error.message : 'Spark 삭제에 실패했습니다.'
    const status = message.includes('찾을 수 없') ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
