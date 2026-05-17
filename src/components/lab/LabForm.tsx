'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SparkStagePicker } from '@/components/spark/SparkStagePicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { parseTechStackInput } from '@/lib/tech-stack'
import type { SparkStage } from '@/types'

type LabFormProps = {
  sparkId: string
}

export function LabForm({ sparkId }: LabFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [stage, setStage] = useState<SparkStage>('build')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const formEl = e.currentTarget
    const form = new FormData(formEl)

    try {
      const res = await fetch(`/api/sparks/${sparkId}/labs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          content: form.get('content'),
          techStack: parseTechStackInput(String(form.get('techStack') ?? '')),
          sourceUrl: form.get('sourceUrl') || undefined,
        }),
      })

      let data: { error?: string } = {}
      const text = await res.text()
      if (text) {
        try {
          data = JSON.parse(text) as { error?: string }
        } catch {
          setError('서버 응답을 처리하지 못했습니다.')
          return
        }
      }

      if (!res.ok) {
        setError(data.error ?? '등록에 실패했습니다.')
        return
      }

      formEl.reset()
      setStage('build')
      router.refresh()
    } catch (err) {
      console.error('[LabForm]', err)
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="mt-8 border-hairline shadow-linear">
      <CardHeader>
        <CardTitle className="text-base">Lab 기록 추가</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <SparkStagePicker value={stage} onChange={setStage} disabled={pending} />
          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              마크다운 형식으로 저장·표시됩니다. 목록, 링크, 강조 등을 사용할 수
              있습니다.
            </p>
            <Textarea id="content" name="content" required rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="techStack">기술 스택 (쉼표로 구분, 선택)</Label>
            <Input
              id="techStack"
              name="techStack"
              placeholder="Next.js, D1, Tailwind"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">GitHub / 참고 링크 (선택)</Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              저장소, 커밋, PR, 브랜치 URL을 붙이면 변경 이력·코드를 GitHub에서
              바로 확인할 수 있습니다. 긴 코드는 붙이지 마세요.
            </p>
            <Input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              inputMode="url"
              placeholder="https://github.com/owner/repo/commit/…"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? '저장 중…' : 'Lab 추가'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
