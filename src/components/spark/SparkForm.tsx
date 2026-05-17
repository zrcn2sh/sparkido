'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { SparkStage } from '@/types'

const STAGES: { value: SparkStage; label: string }[] = [
  { value: 'idea', label: '아이디어' },
  { value: 'validating', label: '검증 중' },
  { value: 'building', label: '개발 중' },
  { value: 'launched', label: '출시' },
]

export function SparkForm() {
  const router = useRouter()
  const pathname = usePathname()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [stage, setStage] = useState<SparkStage>('idea')
  const [mode, setMode] = useState<'solo' | 'open'>('solo')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(e.currentTarget)
    const techRaw = String(form.get('techStack') ?? '')
    const techStack = techRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    try {
      const res = await fetch('/api/sparks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: form.get('problem'),
          audience: form.get('audience'),
          solution: form.get('solution'),
          stage,
          mode,
          techStack,
        }),
      })

      const data = (await res.json()) as {
        spark?: { id: string }
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? '등록에 실패했습니다.')
        return
      }
      const detailPath = pathname.startsWith('/spark')
        ? `/spark/${data.spark!.id}`
        : `/${data.spark!.id}`
      router.push(detailPath)
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="problem">어떤 불편함을 해결하고 싶나요? *</Label>
        <Textarea
          id="problem"
          name="problem"
          required
          rows={3}
          placeholder="해결하고 싶은 문제를 적어 주세요"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="audience">누가 이 문제를 겪나요? *</Label>
        <Textarea
          id="audience"
          name="audience"
          required
          rows={2}
          placeholder="타깃 사용자"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="solution">어떻게 풀 생각인가요? *</Label>
        <Textarea
          id="solution"
          name="solution"
          required
          rows={3}
          placeholder="접근 방식, MVP 아이디어"
        />
      </div>
      <div className="space-y-2">
        <Label>진행 단계</Label>
        <Select
          value={stage}
          onValueChange={(v) => setStage(v as SparkStage)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="techStack">기술 스택 (쉼표로 구분, 선택)</Label>
        <Input
          id="techStack"
          name="techStack"
          placeholder="Next.js, D1, Tailwind"
        />
      </div>
      <fieldset className="space-y-3">
        <Label>참여 방식 *</Label>
        <RadioGroup
          value={mode}
          onValueChange={(v) => setMode(v as 'solo' | 'open')}
          className="gap-3"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="solo" />
            Solo Do — 작성자만 Lab 작성
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <RadioGroupItem value="open" />
            Open Do — 누구나 Lab 참여
          </label>
        </RadioGroup>
      </fieldset>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? '등록 중…' : 'Spark 등록'}
      </Button>
    </form>
  )
}
