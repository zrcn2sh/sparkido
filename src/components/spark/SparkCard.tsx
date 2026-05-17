import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SPARK_MODE_LABELS } from '@/lib/constants'
import {
  SPARK_STAGE_BADGE_CLASS,
  SPARK_STAGE_LABELS,
} from '@/lib/stage-badge'
import { parseSparkContent } from '@/lib/sparks'
import { cn } from '@/lib/utils'
import type { Spark } from '@/types'

type SparkCardProps = {
  spark: Spark
}

export function SparkCard({ spark }: SparkCardProps) {
  const content = parseSparkContent(spark.content)

  return (
    <Card
      size="sm"
      className="shadow-linear border-hairline transition-colors hover:ring-foreground/15"
    >
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn('font-medium', SPARK_STAGE_BADGE_CLASS[spark.stage])}
          >
            {SPARK_STAGE_LABELS[spark.stage]}
          </Badge>
          <Badge variant="secondary">{SPARK_MODE_LABELS[spark.mode]}</Badge>
          {spark.voltage > 0 && (
            <span className="text-xs text-muted-foreground">
              ⚡ {spark.voltage}V
            </span>
          )}
        </div>
        <Link href={`/${spark.id}`} className="group block space-y-1">
          <CardTitle className="group-hover:text-primary">
            {spark.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {content.problem}
          </CardDescription>
        </Link>
      </CardHeader>
    </Card>
  )
}
