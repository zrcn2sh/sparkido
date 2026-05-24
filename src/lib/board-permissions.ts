import { isAdmin } from '@/lib/user-role'
import type { BoardCategory, BoardComment, BoardPost } from '@/types'

/** 공지사항 글쓰기 — 관리자만 */
export async function canCreateBoardPost(
  userId: string,
  category: BoardCategory,
): Promise<boolean> {
  if (category === 'notice') {
    return isAdmin(userId)
  }
  return true
}

/** 게시글 수정·삭제 — 작성자 또는 관리자 */
export async function canManageBoardPost(
  userId: string | null | undefined,
  post: BoardPost,
): Promise<boolean> {
  if (!userId) return false
  if (post.authorId === userId) return true
  return isAdmin(userId)
}

/** 댓글 작성 — 로그인 회원 */
export function canCreateBoardComment(userId: string | null | undefined): boolean {
  return !!userId
}

/** 댓글 수정·삭제 — 작성자 또는 관리자 */
export async function canManageBoardComment(
  userId: string | null | undefined,
  comment: BoardComment,
): Promise<boolean> {
  if (!userId) return false
  if (comment.authorId === userId) return true
  return isAdmin(userId)
}
