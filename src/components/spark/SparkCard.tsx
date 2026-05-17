import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SparkModeLabel } from '@/components/spark/SparkModeLabel'
import { getSparkStageMeta } from '@/lib/spark-stages'
import { formatKstDate } from '@/lib/datetime'
import { parseSparkContent } from '@/lib/spark-content'
import { resolveSparkPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { headers } from 'next/headers'
import type { Spark } from '@/types'

type SparkCardProps = {
  spark: Spark
}

export function SparkCard({ spark }: SparkCardProps) {
  const host = headers().get('host') ?? ''
  const content = parseSparkContent(spark.content)
  const stageMeta = getSparkStageMeta(spark.stage)
  const updatedLabel = formatKstDate(spark.updatedAt)

  return (
    <Card
      size="sm"
      className="shadow-linear flex h-full flex-col border-hairline transition-colors hover:border-primary/30 hover:ring-foreground/15"
    >
      <CardHeader className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
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
            <SparkModeLabel mode={spark.mode} />
          </Badge>
          {spark.visibility === 'private' && (
            <Badge variant="outline" className="text-muted-foreground">
              비공개
            </Badge>
          )}
          {spark.voltage > 0 && (
            <span className="text-xs text-muted-foreground">
              ⚡ {spark.voltage}V
            </span>
          )}
        </div>
        <Link
          href={resolveSparkPath(`/${spark.id}`, host)}
          className="group block flex-1 space-y-1"
        >
          <CardTitle className="group-hover:text-primary">
            {spark.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {content.problem}
          </CardDescription>
        </Link>
        <time
          dateTime={spark.updatedAt}
          className="text-xs text-muted-foreground"
        >
          {updatedLabel} 업데이트
        </time>
      </CardHeader>
    </Card>
  )
}
