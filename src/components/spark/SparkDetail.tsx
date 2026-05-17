import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SPARK_MODE_LABELS } from '@/lib/constants'
import {
  SPARK_STAGE_BADGE_CLASS,
  SPARK_STAGE_LABELS,
} from '@/lib/stage-badge'
import { parseSparkContent } from '@/lib/sparks'
import { cn } from '@/lib/utils'
import type { Spark } from '@/types'

type SparkDetailProps = {
  spark: Spark
}

export function SparkDetail({ spark }: SparkDetailProps) {
  const content = parseSparkContent(spark.content)

  return (
    <Card className="shadow-linear border-hairline">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn('font-medium', SPARK_STAGE_BADGE_CLASS[spark.stage])}
          >
            {SPARK_STAGE_LABELS[spark.stage]}
          </Badge>
          <Badge variant="secondary">{SPARK_MODE_LABELS[spark.mode]}</Badge>
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
        {content.techStack && content.techStack.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2">
              {content.techStack.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
