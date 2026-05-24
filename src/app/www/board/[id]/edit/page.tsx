export const runtime = 'edge'

import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { BoardPostForm } from '@/components/board/BoardPostForm'
import { Button } from '@/components/ui/button'
import { canManageBoardPost } from '@/lib/board-permissions'
import { getBoardPostById } from '@/lib/board'

export const dynamic = 'force-dynamic'

type BoardEditPageProps = {
  params: { id: string }
}

export default async function BoardEditPage({ params }: BoardEditPageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(`/board/${params.id}/edit`)}`,
    )
  }

  const post = await getBoardPostById(params.id)
  if (!post) notFound()
  if (!(await canManageBoardPost(userId, post))) {
    redirect(`/board/${params.id}`)
  }

  return (
    <section className="max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 h-8 text-muted-foreground"
        render={<Link href={`/board/${post.id}`} />}
      >
        ← 게시글
      </Button>
      <h1>게시글 수정</h1>
      <BoardPostForm
        mode="edit"
        category={post.category}
        postId={post.id}
        initial={{ title: post.title, content: post.content }}
      />
    </section>
  )
}
