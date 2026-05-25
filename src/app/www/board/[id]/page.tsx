import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteBoardPostButton } from '@/components/board/DeleteBoardPostButton'
import { MarkdownBody } from '@/components/markdown/MarkdownBody'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getBoardCategoryMeta } from '@/lib/board-categories'
import { formatKstDateTime } from '@/lib/datetime'
import { BoardCommentsSection } from '@/components/board/BoardCommentsSection'
import { getUserDisplayName } from '@/lib/auth'
import { canManageBoardPost } from '@/lib/board-permissions'
import { getBoardPostById } from '@/lib/board'
import { getRequestHost } from '@/lib/request-host'
import { resolveBoardPath } from '@/lib/routes'

export const dynamic = 'force-dynamic'

type BoardDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function BoardDetailPage(props: BoardDetailPageProps) {
  const params = await props.params
  const host = await getRequestHost()
  const { userId } = await auth()
  let post: Awaited<ReturnType<typeof getBoardPostById>> = null

  try {
    post = await getBoardPostById(params.id)
  } catch (error) {
    console.error('[BoardDetailPage]', error)
    throw error
  }

  if (!post) notFound()

  const canManage = await canManageBoardPost(userId, post)
  const categoryMeta = getBoardCategoryMeta(post.category)
  const authorName = await getUserDisplayName(post.authorId)

  return (
    <article className="max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 h-8 text-muted-foreground"
        render={<Link href={resolveBoardPath(`/${post.category}`, host)} />}
      >
        ← {categoryMeta.label}
      </Button>

      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="min-w-0 flex-1">{post.title}</h1>
          <p className="shrink-0 text-right text-xs text-muted-foreground">
            <span>{authorName}</span>
            <span className="mx-1.5 text-border" aria-hidden>
              ·
            </span>
            <time dateTime={post.updatedAt} className="tabular-nums">
              {formatKstDateTime(post.updatedAt)}
              {post.updatedAt !== post.createdAt && ' (수정됨)'}
            </time>
          </p>
        </div>
      </header>

      {canManage && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            render={<Link href={resolveBoardPath(`/${post.id}/edit`, host)} />}
          >
            수정
          </Button>
          <DeleteBoardPostButton postId={post.id} category={post.category} />
        </div>
      )}

      <Separator className="my-8" />

      <MarkdownBody content={post.content} />

      <BoardCommentsSection postId={post.id} userId={userId} />
    </article>
  )
}
