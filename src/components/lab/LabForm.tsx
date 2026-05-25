'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SparkStagePicker } from '@/components/spark/SparkStagePicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  getLabSourceUrlValidationError,
  LAB_SOURCE_URL_SCHEME_MESSAGE,
} from '@/lib/lab-links'
import { parseTechStackInput } from '@/lib/tech-stack'
import { dispatchUserFuelChanged } from '@/lib/user-fuel-events'
import type { SparkStage } from '@/types'

type LabFormProps = {
  sparkId: string
}

export function LabForm({ sparkId }: LabFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [sourceUrlError, setSourceUrlError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [stage, setStage] = useState<SparkStage>('build')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSourceUrlError(null)

    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const sourceUrlRaw = String(form.get('sourceUrl') ?? '')
    const urlValidationError = getLabSourceUrlValidationError(sourceUrlRaw)
    if (urlValidationError) {
      setSourceUrlError(urlValidationError)
      return
    }

    setPending(true)

    try {
      const res = await fetch(`/api/sparks/${sparkId}/labs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          content: form.get('content'),
          techStack: parseTechStackInput(String(form.get('techStack') ?? '')),
          sourceUrl: sourceUrlRaw.trim() || undefined,
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
        const message = data.error ?? '등록에 실패했습니다.'
        if (
          message === LAB_SOURCE_URL_SCHEME_MESSAGE ||
          message.includes('http') ||
          message.includes('참고 링크')
        ) {
          setSourceUrlError(message)
        } else {
          setError(message)
        }
        return
      }

      formEl.reset()
      setStage('build')
      dispatchUserFuelChanged()
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
            <Label htmlFor="content">Lab 본문 *</Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Enter로 넣은 줄바꿈은 그대로 표시됩니다. 마크다운(# 제목, **굵게** 등)도
              사용할 수 있습니다.
            </p>
            <Textarea id="content" name="content" required rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">링크 (선택)</Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              http·https URL만 등록됩니다. GitHub 저장소·커밋·PR 등.
            </p>
            <Input
              id="sourceUrl"
              name="sourceUrl"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="https://github.com/owner/repo/commit/…"
              aria-invalid={sourceUrlError ? true : undefined}
              aria-describedby={sourceUrlError ? 'sourceUrl-error' : undefined}
              onChange={() => setSourceUrlError(null)}
            />
            {sourceUrlError && (
              <p
                id="sourceUrl-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {sourceUrlError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="techStack">기술 스택 (선택)</Label>
            <Input
              id="techStack"
              name="techStack"
              placeholder="Next.js, D1, Tailwind"
            />
          </div>
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? '저장 중…' : 'Lab 추가'}
          </Button>
          {error && (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
