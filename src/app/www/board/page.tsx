import { Card, CardContent } from '@/components/ui/card'

export default function BoardPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <h1>게시판</h1>
      <Card className="mt-6 border-hairline shadow-linear">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          게시판 기능은 Phase 1 후반에 구현됩니다.
        </CardContent>
      </Card>
    </section>
  )
}
