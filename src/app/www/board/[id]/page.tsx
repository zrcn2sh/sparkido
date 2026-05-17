import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DeleteBoardPostButton } from '@/components/board/DeleteBoardPostButton'
import { MarkdownBody } from '@/components/markdown/MarkdownBody'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getBoardCategoryMeta } from '@/lib/board-categories'
import { getBoardPostById } from '@/lib/board'

export const dynamic = 'force-dynamic'

type BoardDetailPageProps = {
  params: { id: string }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  const { userId } = await auth()
  let post: Awaited<ReturnType<typeof getBoardPostById>> = null

  try {
    post = await getBoardPostById(params.id)
  } catch (error) {
    console.error('[BoardDetailPage]', error)
    throw error
  }

  if (!post) notFound()

  const isOwner = !!userId && post.authorId === userId
  const categoryMeta = getBoardCategoryMeta(post.category)

  return (
    <article className="max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 h-8 text-muted-foreground"
        render={<Link href={`/board/${post.category}`} />}
      >
        ← {categoryMeta.label}
      </Button>

      <header>
        <h1>{post.title}</h1>
        <time
          dateTime={post.updatedAt}
          className="mt-2 block text-xs text-muted-foreground"
        >
          {formatDateTime(post.updatedAt)}
          {post.updatedAt !== post.createdAt && ' (수정됨)'}
        </time>
      </header>

      {isOwner && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/board/${post.id}/edit`} />}
          >
            수정
          </Button>
          <DeleteBoardPostButton postId={post.id} category={post.category} />
        </div>
      )}

      <Separator className="my-8" />

      <MarkdownBody content={post.content} />
    </article>
  )
}
