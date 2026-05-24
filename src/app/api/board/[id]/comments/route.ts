import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonForbidden, jsonUnauthorized } from '@/lib/api'
import { getBoardPostById } from '@/lib/board'
import { canCreateBoardComment } from '@/lib/board-permissions'
import {
  createBoardComment,
  listBoardCommentsByPostId,
  validateCommentContent,
} from '@/lib/board-comments'

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

    const comments = await listBoardCommentsByPostId(params.id)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('[GET /api/board/[id]/comments]', error)
    return NextResponse.json(
      { error: '댓글을 불러오지 못했습니다.' },
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

    if (!canCreateBoardComment(userId)) {
      return jsonForbidden('댓글을 작성할 권한이 없습니다.')
    }

    const post = await getBoardPostById(params.id)
    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 },
      )
    }

    const body = (await request.json()) as { content?: string }
    let content: string
    try {
      content = validateCommentContent(body.content)
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : '댓글이 올바르지 않습니다.')
    }

    const comment = await createBoardComment(params.id, userId, content)
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/board/[id]/comments]', error)
    return NextResponse.json(
      { error: '댓글 등록에 실패했습니다.' },
      { status: 500 },
    )
  }
}
