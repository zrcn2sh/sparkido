import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type SparkPrivateNoticeProps = {
  title: string
}

export function SparkPrivateNotice({ title }: SparkPrivateNoticeProps) {
  return (
    <Card className="border-hairline shadow-linear">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <Badge variant="outline" className="text-muted-foreground">
            본문 비공개
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          제목은 공개되어 있으나, 아이디어 본문(문제·타깃·해결 방향 등)은
          비공개입니다. Lab History는 그대로 확인할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  )
}