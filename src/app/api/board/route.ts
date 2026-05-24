import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonError, jsonForbidden, jsonUnauthorized } from '@/lib/api'
import { canCreateBoardPost } from '@/lib/board-permissions'
import { isBoardCategory } from '@/lib/board-categories'
import { createBoardPost, listBoardPosts } from '@/lib/board'
import type { CreateBoardPostInput } from '@/lib/board'
import type { BoardCategory } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category')

    if (!categoryParam || !isBoardCategory(categoryParam)) {
      return jsonError('category(notice|qna|free)가 필요합니다.')
    }

    const posts = await listBoardPosts(categoryParam as BoardCategory)
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('[GET /api/board]', error)
    return NextResponse.json(
      { error: '게시글 목록을 불러오지 못했습니다.' },
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

    const body = (await request.json()) as Partial<CreateBoardPostInput>

    if (!body.category || !isBoardCategory(body.category)) {
      return jsonError('게시판 카테고리가 올바르지 않습니다.')
    }
    if (!body.title?.trim()) {
      return jsonError('제목을 입력해 주세요.')
    }
    if (!body.content?.trim()) {
      return jsonError('내용을 입력해 주세요.')
    }

    if (!(await canCreateBoardPost(userId, body.category))) {
      return jsonForbidden('공지사항은 관리자만 작성할 수 있습니다.')
    }

    const post = await createBoardPost(
      {
        category: body.category,
        title: body.title,
        content: body.content,
      },
      userId,
    )

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/board]', error)
    return NextResponse.json(
      { error: '게시글 등록에 실패했습니다.' },
      { status: 500 },
    )
  }
}
