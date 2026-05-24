import Link from 'next/link'
import { BoardCommentForm } from '@/components/board/BoardCommentForm'
import { BoardCommentItem } from '@/components/board/BoardCommentItem'
import { listBoardCommentsByPostId } from '@/lib/board-comments'
import { canManageBoardComment } from '@/lib/board-permissions'
import { getDisplayNamesByUserIds } from '@/lib/auth'

type BoardCommentsSectionProps = {
  postId: string
  userId: string | null
}

export async function BoardCommentsSection({
  postId,
  userId,
}: BoardCommentsSectionProps) {
  const comments = await listBoardCommentsByPostId(postId)
  const authorIds = Array.from(new Set(comments.map((c) => c.authorId)))
  const authorNames = await getDisplayNamesByUserIds(authorIds)

  const manageFlags = await Promise.all(
    comments.map((c) => canManageBoardComment(userId, c)),
  )

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">
        댓글 <span className="text-muted-foreground">{comments.length}</span>
      </h2>

      {userId ? (
        <div className="mt-4 rounded-lg border-hairline border border-border bg-muted/20 p-4">
          <BoardCommentForm postId={postId} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          댓글을 작성하려면{' '}
          <Link href="/sign-in" className="text-primary underline-offset-4 hover:underline">
            로그인
          </Link>
          이 필요합니다.
        </p>
      )}

      {comments.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {comments.map((comment, i) => (
            <BoardCommentItem
              key={comment.id}
              postId={postId}
              comment={comment}
              authorName={authorNames[comment.authorId] ?? '알 수 없음'}
              canManage={manageFlags[i]}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          아직 댓글이 없습니다.
        </p>
      )}
    </section>
  )
}
