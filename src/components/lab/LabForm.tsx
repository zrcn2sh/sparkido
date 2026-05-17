'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { LabLogType } from '@/types'

const LAB_TYPES: LabLogType[] = [
  '개발',
  '리서치',
  '고객 인터뷰',
  'AI 프롬프트',
  '디자인',
  '피벗',
  '출시',
]

type LabFormProps = {
  sparkId: string
}

export function LabForm({ sparkId }: LabFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [type, setType] = useState<LabLogType>('개발')

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
          type,
          content: form.get('content'),
          codeSnippet: form.get('codeSnippet') || undefined,
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
      setType('개발')
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>타입</Label>
            <Select value={type} onValueChange={(v) => setType(v as LabLogType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LAB_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <Textarea id="content" name="content" required rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codeSnippet">코드 스니펫 (선택)</Label>
            <Textarea
              id="codeSnippet"
              name="codeSnippet"
              rows={3}
              className="font-mono"
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
