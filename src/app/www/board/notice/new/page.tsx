import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BoardPostForm } from '@/components/board/BoardPostForm'
import { Button } from '@/components/ui/button'
import { getBoardCategoryMeta } from '@/lib/board-categories'

export default async function BoardNoticeNewPage() {
  const { userId } = await auth()
  const meta = getBoardCategoryMeta('notice')

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent('/board/notice/new')}`)
  }

  return (
    <section className="max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 h-8 text-muted-foreground"
        render={<Link href="/board/notice" />}
      >
        ← {meta.label}
      </Button>
      <h1>글쓰기</h1>
      <p className="mt-2 text-muted-foreground">{meta.description}</p>
      <BoardPostForm mode="create" category="notice" />
    </section>
  )
}
