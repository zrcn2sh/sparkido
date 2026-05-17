'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SparkModeLabel } from '@/components/spark/SparkModeLabel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { PRIVATE_SPARK_OTHER_LABS_MESSAGE } from '@/lib/constants'
import {
  SPARK_FIELD_LIMITS,
  SPARK_FORM_PLACEHOLDERS,
} from '@/lib/spark-form'
import { parseSparkContent } from '@/lib/spark-content'
import type { Spark, SparkMode, SparkVisibility } from '@/types'

type SparkEditFormProps = {
  spark: Spark
  otherContributorLabs: boolean
  detailPath: string
}

export function SparkEditForm({
  spark,
  otherContributorLabs,
  detailPath,
}: SparkEditFormProps) {
  const router = useRouter()
  const content = parseSparkContent(spark.content)

  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [mode, setMode] = useState<SparkMode>(spark.mode)
  const [visibility, setVisibility] = useState<SparkVisibility>(spark.visibility)
  const [confirmPrivate, setConfirmPrivate] = useState(false)
  const [pendingVisibility, setPendingVisibility] =
    useState<SparkVisibility | null>(null)

  const soloDisabled = spark.mode === 'open' && otherContributorLabs

  function requestVisibility(next: SparkVisibility) {
    if (next === visibility) return
    if (next === 'private' && otherContributorLabs) {
      setPendingVisibility('private')
      setConfirmPrivate(true)
      return
    }
    setVisibility(next)
  }

  function confirmPrivateChange() {
    if (pendingVisibility === 'private') {
      setVisibility('private')
    }
    setPendingVisibility(null)
    setConfirmPrivate(false)
  }

  function cancelPrivateChange() {
    setPendingVisibility(null)
    setConfirmPrivate(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch(`/api/sparks/${spark.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.get('title'),
          notes: form.get('notes'),
          mode,
          visibility,
        }),
      })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? '저장에 실패했습니다.')
        return
      }

      router.push(detailPath)
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="title">Spark 제목 *</Label>
          <Input
            id="title"
            name="title"
            required
            maxLength={SPARK_FIELD_LIMITS.title}
            defaultValue={spark.title}
            placeholder={SPARK_FORM_PLACEHOLDERS.title}
          />
        </div>

        <div className="space-y-3 rounded-lg border-hairline border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground">
            아래 항목은 수정할 수 없습니다
          </p>
          <div className="space-y-1 rounded-md bg-muted px-3 py-2.5">
            <p className="text-sm text-muted-foreground">
              어떤 불편함을 해결하고 싶나요?
            </p>
            <p className="whitespace-pre-wrap text-sm text-foreground/90">
              {content.problem}
            </p>
          </div>
          <div className="space-y-1 rounded-md bg-muted px-3 py-2.5">
            <p className="text-sm text-muted-foreground">누가 이 문제를 겪나요?</p>
            <p className="whitespace-pre-wrap text-sm text-foreground/90">
              {content.audience}
            </p>
          </div>
          <div className="space-y-1 rounded-md bg-muted px-3 py-2.5">
            <p className="text-sm text-muted-foreground">
              어떻게 풀 생각인가요?
            </p>
            <p className="whitespace-pre-wrap text-sm text-foreground/90">
              {content.solution}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">더 하고 싶은 말 (선택)</Label>
          <p className="text-xs text-muted-foreground">
            마크다운 형식으로 저장·표시됩니다.
          </p>
          <Textarea
            id="notes"
            name="notes"
            rows={6}
            maxLength={SPARK_FIELD_LIMITS.notes}
            defaultValue={content.notes ?? ''}
            placeholder={SPARK_FORM_PLACEHOLDERS.notes}
          />
        </div>

        <fieldset className="space-y-3">
          <Label>참여 방식</Label>
          {otherContributorLabs && spark.mode === 'open' && (
            <p className="text-xs text-muted-foreground">
              다른 참여자의 Lab이 있으면 Solo Do로 바꿀 수 없습니다.
            </p>
          )}
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as SparkMode)}
            className="gap-3"
          >
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="solo" disabled={soloDisabled} />
              <SparkModeLabel mode="solo" />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="open" />
              <SparkModeLabel mode="open" />
            </label>
          </RadioGroup>
        </fieldset>

        <fieldset className="space-y-3">
          <Label>공개 설정</Label>
          <p className="text-xs text-muted-foreground">
            Spark는 삭제할 수 없습니다. 비공개로 전환하면 본문만 숨기고 Lab
            기록은 유지됩니다.
          </p>
          <RadioGroup
            value={visibility}
            onValueChange={(v) => requestVisibility(v as SparkVisibility)}
            className="gap-3"
          >
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="public" />
              공개
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="private" />
              비공개
            </label>
          </RadioGroup>
        </fieldset>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? '저장 중…' : '변경 사항 저장'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            render={<Link href={detailPath} />}
          >
            취소
          </Button>
        </div>
      </form>

      {confirmPrivate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="private-confirm-title"
        >
          <div className="w-full max-w-md rounded-lg border-hairline border border-border bg-card p-6 shadow-linear">
            <h2 id="private-confirm-title" className="text-base font-medium">
              비공개로 전환할까요?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {PRIVATE_SPARK_OTHER_LABS_MESSAGE}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Spark 본문만 비공개되며, Lab History는 계속 표시됩니다. 계속
              진행할까요?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={cancelPrivateChange}
              >
                취소
              </Button>
              <Button type="button" onClick={confirmPrivateChange}>
                비공개로 전환
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
