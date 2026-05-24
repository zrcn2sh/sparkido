import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonForbidden, jsonUnauthorized } from '@/lib/api'
import { canManageBoardPost } from '@/lib/board-permissions'
import {
  deleteBoardPost,
  getBoardPostById,
  updateBoardPost,
} from '@/lib/board'
import type { UpdateBoardPostInput } from '@/lib/board'

type RouteContext = { params: { id: string } }

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const post = await getBoardPostById(params.id)
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      )
    }
    return NextResponse.json({ post })
  } catch (error) {
    console.error('[GET /api/board/[id]]', error)
    return NextResponse.json(
      { error: '게시글을 불러오지 못했습니다.' },
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

    const post = await getBoardPostById(params.id)
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      )
    }
    if (!(await canManageBoardPost(userId, post))) {
      return jsonForbidden('게시글을 수정할 권한이 없습니다.')
    }

    const body = (await request.json()) as Partial<UpdateBoardPostInput>

    if (body.title !== undefined && !body.title.trim()) {
      return jsonError('제목을 입력해 주세요.')
    }
    if (body.content !== undefined && !body.content.trim()) {
      return jsonError('내용을 입력해 주세요.')
    }

    const updated = await updateBoardPost(params.id, {
      title: body.title,
      content: body.content,
    })

    return NextResponse.json({ post: updated })
  } catch (error) {
    console.error('[PATCH /api/board/[id]]', error)
    return NextResponse.json(
      { error: '게시글 수정에 실패했습니다.' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return jsonUnauthorized()
    }

    const post = await getBoardPostById(params.id)
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      )
    }
    if (!(await canManageBoardPost(userId, post))) {
      return jsonForbidden('게시글을 삭제할 권한이 없습니다.')
    }

    await deleteBoardPost(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/board/[id]]', error)
    return NextResponse.json(
      { error: '게시글 삭제에 실패했습니다.' },
      { status: 500 },
    )
  }
}
