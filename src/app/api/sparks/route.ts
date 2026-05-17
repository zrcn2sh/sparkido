import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonUnauthorized, isSparkMode, isSparkStage } from '@/lib/api'
import { createSpark, listSparks } from '@/lib/sparks'
import type { CreateSparkInput } from '@/lib/sparks'

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

    const body = (await request.json()) as Partial<CreateSparkInput>

    if (!body.problem?.trim()) {
      return jsonError('어떤 불편함을 해결하고 싶은지 입력해 주세요.')
    }
    if (!body.audience?.trim()) {
      return jsonError('누가 이 문제를 겪는지 입력해 주세요.')
    }
    if (!body.solution?.trim()) {
      return jsonError('어떻게 풀 생각인지 입력해 주세요.')
    }
    if (!isSparkStage(body.stage)) {
      return jsonError('진행 단계가 올바르지 않습니다.')
    }
    if (!isSparkMode(body.mode)) {
      return jsonError('참여 방식(solo/open)이 올바르지 않습니다.')
    }

    const spark = await createSpark(
      {
        problem: body.problem,
        audience: body.audience,
        solution: body.solution,
        stage: body.stage,
        mode: body.mode,
        techStack: Array.isArray(body.techStack)
          ? body.techStack.map(String)
          : undefined,
        title: body.title,
      },
      userId,
    )

    return NextResponse.json({ spark }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sparks]', error)
    return NextResponse.json(
      { error: 'Spark 등록에 실패했습니다.' },
      { status: 500 },
    )
  }
}
