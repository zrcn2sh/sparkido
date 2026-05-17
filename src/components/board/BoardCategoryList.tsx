import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { BoardPostCard } from '@/components/board/BoardPostCard'
import { Button } from '@/components/ui/button'
import { getBoardCategoryMeta } from '@/lib/board-categories'
import { listBoardPosts } from '@/lib/board'
import type { BoardCategory } from '@/types'

type BoardCategoryListProps = {
  category: BoardCategory
}

export async function BoardCategoryList({ category }: BoardCategoryListProps) {
  const { userId } = await auth()
  const meta = getBoardCategoryMeta(category)

  let posts: Awaited<ReturnType<typeof listBoardPosts>> = []
  let loadError: string | null = null

  try {
    posts = await listBoardPosts(category)
  } catch (error) {
    console.error('[BoardCategoryList]', error)
    loadError =
      '게시글 목록을 불러오지 못했습니다. D1 로컬 DB가 준비되었는지 확인하세요. (npm run db:migrate:local)'
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1>{meta.label}</h1>
          <p className="mt-2 text-muted-foreground">{meta.description}</p>
        </div>
        {userId && (
          <Button
            size="sm"
            className="shrink-0"
            render={<Link href={`/board/${category}/new`} />}
          >
            글쓰기
          </Button>
        )}
      </header>

      {loadError && (
        <p className="mt-8 rounded-lg border-hairline border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {!loadError && posts.length === 0 && (
        <div className="mt-12 rounded-lg border-hairline border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            아직 게시글이 없습니다.
          </p>
          {userId ? (
            <Button
              className="mt-6"
              size="sm"
              render={<Link href={`/board/${category}/new`} />}
            >
              첫 글 작성하기
            </Button>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              글을 작성하려면 로그인이 필요합니다.
            </p>
          )}
        </div>
      )}

      {!loadError && posts.length > 0 && (
        <ul className="mt-8 space-y-3">
          {posts.map((post) => (
            <li key={post.id}>
              <BoardPostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
