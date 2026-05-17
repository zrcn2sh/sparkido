import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonUnauthorized } from '@/lib/api'
import { validateCreateSparkInput } from '@/lib/spark-form'
import { createSpark, listSparks } from '@/lib/sparks'

export async function GET() {
  try {
    const sparks = await listSparks()
    return NextResponse.json({ sparks })
  } catch (error) {
    console.error('[GET /api/sparks]', error)
    return NextResponse.json(
      { error: 'Spark 목록을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return jsonUnauthorized()
    }

    const body = await request.json()
    const validated = validateCreateSparkInput(body)
    if (!validated.ok) {
      return jsonError(validated.error)
    }

    const spark = await createSpark(validated.data, userId)

    return NextResponse.json({ spark }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sparks]', error)
    const message =
      error instanceof Error ? error.message : 'Spark 등록에 실패했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
