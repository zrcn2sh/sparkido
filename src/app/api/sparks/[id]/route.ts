import { NextResponse } from 'next/server'
import { getSparkById } from '@/lib/sparks'

type RouteContext = { params: { id: string } }

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const spark = await getSparkById(params.id)
    if (!spark) {
      return NextResponse.json(
        { error: 'Spark를 찾을 수 없습니다.' },
        { status: 404 },
      )
    }
    return NextResponse.json({ spark })
  } catch (error) {
    console.error('[GET /api/sparks/[id]]', error)
    return NextResponse.json(
      { error: 'Spark 조회에 실패했습니다.' },
      { status: 500 },
    )
  }
}
