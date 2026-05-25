import Link from 'next/link'
import { MarkdownBody } from '@/components/markdown/MarkdownBody'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { formatKstDate } from '@/lib/datetime'
import { cn } from '@/lib/utils'
import { resolveBoardPath } from '@/lib/routes'
import type { BoardPost } from '@/types'

type BoardPostCardProps = {
  post: BoardPost
  host: string
  authorName: string
}

export function BoardPostCard({ post, host, authorName }: BoardPostCardProps) {
  return (
    <Card
      size="sm"
      className="shadow-linear border-hairline transition-colors hover:border-primary/30"
    >
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={resolveBoardPath(`/${post.id}`, host)}
            className="group min-w-0 flex-1 space-y-2"
          >
            <CardTitle className="group-hover:text-primary">{post.title}</CardTitle>
            <div
              className={cn(
                'pointer-events-none line-clamp-3 overflow-hidden text-muted-foreground',
                '[&_.markdown-body]:text-muted-foreground',
              )}
            >
              <MarkdownBody content={post.content} compact />
            </div>
          </Link>
          <p className="shrink-0 text-right text-xs leading-snug text-muted-foreground">
            <span className="block">{authorName}</span>
            <time
              dateTime={post.createdAt}
              className="mt-0.5 block tabular-nums"
            >
              {formatKstDate(post.createdAt)}
            </time>
          </p>
        </div>
      </CardHeader>
    </Card>
  )
}
