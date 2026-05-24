import { SparkNotesCollapsible } from '@/components/spark/SparkNotesCollapsible'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SparkModeLabel } from '@/components/spark/SparkModeLabel'
import { formatKstDateTime } from '@/lib/datetime'
import { getSparkStageMeta } from '@/lib/spark-stages'
import { parseSparkContent } from '@/lib/spark-content'
import { cn } from '@/lib/utils'
import type { Spark } from '@/types'

type SparkDetailProps = {
  spark: Spark
  authorName: string
}

export function SparkDetail({ spark, authorName }: SparkDetailProps) {
  const content = parseSparkContent(spark.content)
  const stageMeta = getSparkStageMeta(spark.stage)

  return (
    <Card className="shadow-linear border-hairline">
      <CardHeader className="gap-3">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn('font-medium', stageMeta.badgeClass)}
            >
              <span className="mr-1" aria-hidden>
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
          </div>
          <p className="shrink-0 text-right text-xs text-muted-foreground">
            <span>{authorName}</span>
            <span className="mx-1.5 text-border" aria-hidden>
              ·
            </span>
            <time
              dateTime={spark.createdAt}
              className="tabular-nums"
            >
              {formatKstDateTime(spark.createdAt)}
            </time>
          </p>
        </div>
        <CardTitle className="text-2xl">{spark.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <section>
          <h3 className="text-sm text-muted-foreground">
            어떤 불편함을 해결하고 싶나요?
          </h3>
          <p className="mt-1.5 whitespace-pre-wrap">{content.problem}</p>
        </section>
        <Separator />
        <section>
          <h3 className="text-sm text-muted-foreground">
            누가 이 문제를 겪나요?
          </h3>
          <p className="mt-1.5 whitespace-pre-wrap">{content.audience}</p>
        </section>
        <Separator />
        <section>
          <h3 className="text-sm text-muted-foreground">
            어떻게 풀 생각인가요?
          </h3>
          <p className="mt-1.5 whitespace-pre-wrap">{content.solution}</p>
        </section>
        {content.notes?.trim() && (
          <>
            <Separator />
            <SparkNotesCollapsible content={content.notes} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
