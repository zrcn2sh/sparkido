'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { SparkFormField } from '@/components/spark/SparkFormField'
import { SparkModeLabel } from '@/components/spark/SparkModeLabel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  SPARK_FIELD_LIMITS,
  SPARK_FORM_PLACEHOLDERS,
} from '@/lib/spark-form'

function useFieldLength(initial = '') {
  const [length, setLength] = useState(initial.length)
  return {
    length,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLength(e.target.value.length)
    },
  }
}

export function SparkForm() {
  const router = useRouter()
  const pathname = usePathname()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [mode, setMode] = useState<'solo' | 'open'>('solo')

  const titleField = useFieldLength()
  const problemField = useFieldLength()
  const audienceField = useFieldLength()
  const solutionField = useFieldLength()
  const notesField = useFieldLength()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/sparks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          problem: form.get('problem'),
          audience: form.get('audience'),
          solution: form.get('solution'),
          notes: form.get('notes') || undefined,
          mode,
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-10">
      <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Spark는 <strong className="font-medium text-foreground">Idea(💡)</strong>
        로 시작합니다. 작업 단계·기술 스택은 Lab 기록 시 남깁니다.
      </p>

      <SparkFormField
        id="title"
        label="Spark 제목"
        required
        maxLength={SPARK_FIELD_LIMITS.title}
        valueLength={titleField.length}
        guide={{
          description: '"~를 위한 ~" 형태로 쓰면 좋아요.',
          example: '소규모 한의원 원장을 위한 예약 자동화',
        }}
      >
        <Input
          id="title"
          name="title"
          required
          maxLength={SPARK_FIELD_LIMITS.title}
          placeholder={SPARK_FORM_PLACEHOLDERS.title}
          onChange={titleField.onChange}
        />
      </SparkFormField>

      <SparkFormField
        id="problem"
        label="어떤 불편함을 해결하고 싶나요?"
        required
        maxLength={SPARK_FIELD_LIMITS.problem}
        valueLength={problemField.length}
        guide={{
          description:
            '구체적일수록 좋아요. "불편하다"보다 하루 몇 번·어떤 상황에서 불편한지 적어 주세요.',
          example:
            '한의원 원장이 예약 전화를 하루 30건 이상 직접 받고 있다',
        }}
      >
        <Textarea
          id="problem"
          name="problem"
          required
          rows={4}
          maxLength={SPARK_FIELD_LIMITS.problem}
          placeholder={SPARK_FORM_PLACEHOLDERS.problem}
          onChange={problemField.onChange}
        />
      </SparkFormField>

      <SparkFormField
        id="audience"
        label="누가 이 문제를 겪나요?"
        required
        maxLength={SPARK_FIELD_LIMITS.audience}
        valueLength={audienceField.length}
        guide={{
          description:
            '"모든 사람"보다 좁을수록 좋아요. 직업·상황·규모를 넣으면 더 명확해요.',
          example: '직원 없이 혼자 운영하는 한의원 원장, 40~55세',
        }}
      >
        <Textarea
          id="audience"
          name="audience"
          required
          rows={3}
          maxLength={SPARK_FIELD_LIMITS.audience}
          placeholder={SPARK_FORM_PLACEHOLDERS.audience}
          onChange={audienceField.onChange}
        />
      </SparkFormField>

      <SparkFormField
        id="solution"
        label="어떻게 풀 생각인가요?"
        required
        maxLength={SPARK_FIELD_LIMITS.solution}
        valueLength={solutionField.length}
        guide={{
          description:
            '완성된 기획이 아니어도 됩니다. "~하면 어떨까?" 수준으로도 충분해요.',
          example: '카카오 채널로 자동 예약 + 증상별 문진 커스텀',
        }}
      >
        <Textarea
          id="solution"
          name="solution"
          required
          rows={4}
          maxLength={SPARK_FIELD_LIMITS.solution}
          placeholder={SPARK_FORM_PLACEHOLDERS.solution}
          onChange={solutionField.onChange}
        />
      </SparkFormField>

      <SparkFormField
        id="notes"
        label="더 하고 싶은 말이 있나요? (선택)"
        maxLength={SPARK_FIELD_LIMITS.notes}
        valueLength={notesField.length}
        guide={{
          description:
            '경쟁 서비스 URL, 리서치 자료, 이전 시도 경험 등 맥락을 남겨도 좋아요. 마크다운 사용 가능.',
        }}
      >
        <Textarea
          id="notes"
          name="notes"
          rows={6}
          maxLength={SPARK_FIELD_LIMITS.notes}
          placeholder={SPARK_FORM_PLACEHOLDERS.notes}
          onChange={notesField.onChange}
        />
      </SparkFormField>

      <fieldset className="space-y-3 border-0 p-0">
        <Label className="text-base font-medium">
          참여 방식
          <span className="text-destructive" aria-hidden>
            {' '}
            *
          </span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Solo는 나만, Open은 누구나 Lab에 참여할 수 있습니다.
        </p>
        <RadioGroup
          value={mode}
          onValueChange={(v) => setMode(v as 'solo' | 'open')}
          className="gap-4"
        >
          <label className="flex cursor-pointer gap-3 rounded-lg border-hairline border border-border p-3 has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-muted/40">
            <RadioGroupItem value="solo" className="mt-0.5" />
            <span className="space-y-1 text-sm">
              <span className="block font-medium">
                <SparkModeLabel mode="solo" /> — 나만 Lab을 기록합니다
                (아이디어 선점)
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                혼자 개발할 계획이거나 아이디어를 보호하고 싶을 때
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer gap-3 rounded-lg border-hairline border border-border p-3 has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-muted/40">
            <RadioGroupItem value="open" className="mt-0.5" />
            <span className="space-y-1 text-sm">
              <span className="block font-medium">
                <SparkModeLabel mode="open" /> — 누구나 Lab에 참여할 수
                있습니다
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                같이 만들 사람을 찾거나 다양한 시각이 필요할 때
              </span>
            </span>
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
