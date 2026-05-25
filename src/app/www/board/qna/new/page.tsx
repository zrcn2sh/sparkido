import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BoardPostForm } from '@/components/board/BoardPostForm'
import { Button } from '@/components/ui/button'
import { getBoardCategoryMeta } from '@/lib/board-categories'
import { getRequestHost } from '@/lib/request-host'
import { resolveBoardPath } from '@/lib/routes'

export default async function BoardQnaNewPage() {
  const host = await getRequestHost()
  const { userId } = await auth()
  const meta = getBoardCategoryMeta('qna')

  if (!userId) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(resolveBoardPath('/qna/new', host))}`,
    )
  }

  return (
    <section className="max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 h-8 text-muted-foreground"
        render={<Link href={resolveBoardPath('/qna', host)} />}
      >
        ← {meta.label}
      </Button>
      <h1>글쓰기</h1>
      <p className="mt-2 text-muted-foreground">{meta.description}</p>
      <BoardPostForm mode="create" category="qna" />
    </section>
  )
}
