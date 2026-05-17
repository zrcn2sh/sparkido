import Link from 'next/link'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatKstDate } from '@/lib/datetime'
import type { BoardPost } from '@/types'

type BoardPostCardProps = {
  post: BoardPost
}

export function BoardPostCard({ post }: BoardPostCardProps) {
  const excerpt = post.content.replace(/\s+/g, ' ').trim().slice(0, 120)

  return (
    <Card
      size="sm"
      className="shadow-linear border-hairline transition-colors hover:border-primary/30"
    >
      <CardHeader className="gap-2">
        <Link href={`/board/${post.id}`} className="group block space-y-1">
          <CardTitle className="group-hover:text-primary">{post.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {excerpt}
            {post.content.length > 120 ? '…' : ''}
          </CardDescription>
        </Link>
        <time
          dateTime={post.createdAt}
          className="text-xs text-muted-foreground"
        >
          {formatKstDate(post.createdAt)}
        </time>
      </CardHeader>
    </Card>
  )
}
