import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonForbidden, jsonUnauthorized } from '@/lib/api'
import { isSparkStage } from '@/lib/spark-stages'
import { createLabLog, listLabLogsBySparkId } from '@/lib/labs'
import { parseTechStackInput } from '@/lib/tech-stack'
import { getSparkById } from '@/lib/sparks'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, props: RouteContext) {
  const params = await props.params;
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

export async function POST(request: Request, props: RouteContext) {
  const params = await props.params;
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
      stage?: string
      content?: string
      techStack?: unknown
      promptText?: string
      sourceUrl?: string
    }

    if (!body.stage || !isSparkStage(body.stage)) {
      return jsonError('작업 단계(Idea/Build/Live)를 선택해 주세요.')
    }
    if (!body.content?.trim()) {
      return jsonError('Lab 내용을 입력해 주세요.')
    }

    const techStack = Array.isArray(body.techStack)
      ? parseTechStackInput(body.techStack.map(String).join(', '))
      : typeof body.techStack === 'string'
        ? parseTechStackInput(body.techStack)
        : []

    const log = await createLabLog(
      params.id,
      {
        stage: body.stage,
        content: body.content,
        techStack,
        promptText: body.promptText,
        sourceUrl: body.sourceUrl,
      },
      userId,
    )

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sparks/[id]/labs]', error)
    const message =
      error instanceof Error ? error.message : 'Lab 기록 등록에 실패했습니다.'
    const status = message.includes('찾을 수 없') ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
