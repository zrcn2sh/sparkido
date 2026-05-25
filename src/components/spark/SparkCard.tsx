import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SparkModeLabel } from '@/components/spark/SparkModeLabel'
import {
  canViewSparkBody,
  sanitizeSparkForViewer,
  getSparkListSnippet,
} from '@/lib/spark-permissions'
import { getSparkStageMeta } from '@/lib/spark-stages'
import { formatKstDate } from '@/lib/datetime'
import { resolveSparkPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { Spark } from '@/types'

type SparkCardProps = {
  spark: Spark
  host: string
  viewerId?: string | null
  viewerIsAdmin?: boolean
  authorName: string
  /** Open Do — Lab 기준 참여자 수 */
  participantCount?: number
}

export function SparkCard({
  spark,
  host,
  viewerId,
  viewerIsAdmin = false,
  authorName,
  participantCount,
}: SparkCardProps) {
  const perm = { viewerIsAdmin }
  const display = sanitizeSparkForViewer(spark, viewerId, perm)
  const snippet = getSparkListSnippet(viewerId, spark, perm)
  const bodyHidden = !canViewSparkBody(viewerId, spark, perm)
  const stageMeta = getSparkStageMeta(spark.stage)
  const updatedLabel = formatKstDate(spark.updatedAt)

  return (
    <Card
      size="sm"
      className="shadow-linear flex h-full flex-col border-hairline transition-colors hover:border-primary/30 hover:ring-foreground/15"
    >
      <CardHeader className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn('font-medium', stageMeta.badgeClass)}
            >
              <span className="mr-0.5" aria-hidden>
                {stageMeta.icon}
              </span>
              {stageMeta.label}
            </Badge>
            <Badge variant="secondary">
              <SparkModeLabel
                mode={spark.mode}
                participantCount={
                  spark.mode === 'open' ? participantCount : undefined
                }
              />
            </Badge>
            {spark.visibility === 'private' && (
              <Badge variant="outline" className="text-muted-foreground">
                비공개
              </Badge>
            )}
          </div>
          <span
            className="ml-2 max-w-[8rem] shrink-0 truncate text-right text-xs font-medium text-foreground"
            title={authorName}
          >
            {authorName}
          </span>
        </div>
        <Link
          href={resolveSparkPath(`/${spark.id}`, host)}
          className="group block min-h-0 flex-1 space-y-1"
        >
          <CardTitle className="group-hover:text-primary">
            {display.title}
          </CardTitle>
          <CardDescription
            className={cn('line-clamp-2', bodyHidden && 'italic')}
          >
            {snippet}
          </CardDescription>
        </Link>
        <div className="mt-auto flex w-full items-center justify-between gap-2 pt-1">
          <time
            dateTime={spark.updatedAt}
            className="min-w-0 shrink text-xs text-muted-foreground"
          >
            {updatedLabel} 업데이트
          </time>
          <span
            className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-rose-700 dark:text-rose-400"
            title="응원 수"
          >
            <Heart
              className="size-3 fill-rose-500/20 text-rose-500"
              aria-hidden
            />
            <span className="font-mono tabular-nums">{spark.cheerCount}</span>
          </span>
        </div>
      </CardHeader>
    </Card>
  )
}
