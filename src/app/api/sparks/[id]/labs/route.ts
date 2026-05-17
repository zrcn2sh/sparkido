import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonForbidden, jsonUnauthorized } from '@/lib/api'
import { createLabLog, listLabLogsBySparkId } from '@/lib/labs'
import { getSparkById } from '@/lib/sparks'
import type { LabLogType } from '@/types'

const LAB_TYPES: LabLogType[] = [
  '개발',
  '리서치',
  '고객 인터뷰',
  'AI 프롬프트',
  '디자인',
  '피벗',
  '출시',
]

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
    const logs = await listLabLogsBySparkId(params.id)
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('[GET /api/sparks/[id]/labs]', error)
    return NextResponse.json(
      { error: 'Lab 기록을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, { params }: RouteContext) {
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

    if (spark.mode === 'solo' && spark.authorId !== userId) {
      return jsonForbidden('Solo Spark는 작성자만 Lab을 추가할 수 있습니다.')
    }

    const body = (await request.json()) as {
      type?: string
      content?: string
      promptText?: string
      codeSnippet?: string
    }

    if (!body.type || !LAB_TYPES.includes(body.type as LabLogType)) {
      return jsonError('Lab 타입이 올바르지 않습니다.')
    }
    if (!body.content?.trim()) {
      return jsonError('Lab 내용을 입력해 주세요.')
    }

    const log = await createLabLog(
      params.id,
      {
        type: body.type as LabLogType,
        content: body.content,
        promptText: body.promptText,
        codeSnippet: body.codeSnippet,
      },
      userId,
    )

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sparks/[id]/labs]', error)
    return NextResponse.json(
      { error: 'Lab 기록 등록에 실패했습니다.' },
      { status: 500 },
    )
  }
}
