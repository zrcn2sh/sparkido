import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonForbidden, jsonUnauthorized } from '@/lib/api'
import { canManageBoardComment } from '@/lib/board-permissions'
import {
  deleteBoardComment,
  getBoardCommentById,
  updateBoardComment,
  validateCommentContent,
} from '@/lib/board-comments'

type RouteContext = { params: Promise<{ id: string; commentId: string }> }

export async function PATCH(request: Request, props: RouteContext) {
  const params = await props.params;
  try {
    const { userId } = await auth()
    if (!userId) {
      return jsonUnauthorized()
    }

    const comment = await getBoardCommentById(params.commentId)
    if (!comment || comment.postId !== params.id) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 },
      )
    }

    if (!(await canManageBoardComment(userId, comment))) {
      return jsonForbidden('댓글을 수정할 권한이 없습니다.')
    }

    const body = (await request.json()) as { content?: string }
    let content: string
    try {
      content = validateCommentContent(body.content)
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : '댓글이 올바르지 않습니다.')
    }

    const updated = await updateBoardComment(params.commentId, content)
    return NextResponse.json({ comment: updated })
  } catch (error) {
    console.error('[PATCH /api/board/.../comments]', error)
    return NextResponse.json(
      { error: '댓글 수정에 실패했습니다.' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, props: RouteContext) {
  const params = await props.params;
  try {
    const { userId } = await auth()
    if (!userId) {
      return jsonUnauthorized()
    }

    const comment = await getBoardCommentById(params.commentId)
    if (!comment || comment.postId !== params.id) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 },
      )
    }

    if (!(await canManageBoardComment(userId, comment))) {
      return jsonForbidden('댓글을 삭제할 권한이 없습니다.')
    }

    await deleteBoardComment(params.commentId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/board/.../comments]', error)
    return NextResponse.json(
      { error: '댓글 삭제에 실패했습니다.' },
      { status: 500 },
    )
  }
}
