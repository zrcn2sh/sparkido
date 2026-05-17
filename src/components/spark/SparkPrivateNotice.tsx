import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SparkPrivateNotice() {
  return (
    <Card className="border-hairline shadow-linear">
      <CardHeader>
        <CardTitle className="text-lg">비공개 Spark</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          작성자가 이 Spark의 본문을 비공개로 설정했습니다. Lab History는 그대로
          확인할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  )
}
