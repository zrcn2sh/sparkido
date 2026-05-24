'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getLabSourceUrlValidationError } from '@/lib/lab-links'
import { dispatchUserFuelChanged } from '@/lib/user-fuel-events'
import {
  SHOW_CATEGORY_LABELS,
  SHOW_CATEGORY_ORDER,
} from '@/lib/show-labels'
import type { ShowSelectionFuelQuote } from '@/lib/show-config'
import {
  formatPlacementLabel,
  type ShowGridPlacement,
} from '@/lib/show-selection'
import type { ShowTileCategory } from '@/types/show'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ShowRegisterDialogProps = {
  open: boolean
  placements: ShowGridPlacement[]
  fuelQuote?: ShowSelectionFuelQuote | null
  isAlphaPeriod?: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ShowRegisterDialog({
  open,
  placements,
  fuelQuote,
  isAlphaPeriod = false,
  onClose,
  onSuccess,
}: ShowRegisterDialogProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<ShowTileCategory>('web')
  const [linkUrlError, setLinkUrlError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    const tagline = String(form.get('tagline') ?? '').trim()
    const imageUrl = String(form.get('imageUrl') ?? '').trim()
    const iconText = String(form.get('iconText') ?? '').trim()
    const linkUrl = String(form.get('linkUrl') ?? '').trim()

    if (!title) {
      setError('서비스명을 입력해 주세요.')
      return
    }
    if (!tagline) {
      setError('소개를 입력해 주세요.')
      return
    }
    if (!imageUrl && !iconText) {
      setError('이미지 URL 또는 아이콘(이모지) 중 하나를 입력해 주세요.')
      return
    }

    const linkErr = getLabSourceUrlValidationError(linkUrl)
    if (linkErr) {
      setLinkUrlError(linkErr)
      return
    }
    setLinkUrlError(null)

    if (imageUrl) {
      const imgErr = getLabSourceUrlValidationError(imageUrl)
      if (imgErr) {
        setError(`이미지: ${imgErr}`)
        return
      }
    }

    setPending(true)
    try {
      const res = await fetch('/api/show/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placements,
          title,
          tagline,
          category,
          imageUrl: imageUrl || undefined,
          iconText: iconText || undefined,
          linkUrl,
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? '등록에 실패했습니다.')
        return
      }
      dispatchUserFuelChanged()
      onSuccess()
      onClose()
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="show-register-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-hairline bg-card shadow-linear sm:rounded-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2 id="show-register-title" className="text-lg font-semibold">
              Show 타일 등록
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatPlacementLabel(placements)}
              {fuelQuote ? (
                <span className="mt-0.5 block tabular-nums">
                  일 ⚡ {fuelQuote.dailyFuel} · 이번 달 ⚡ {fuelQuote.periodFuel} (
                  {fuelQuote.remainingDays}일
                  {!isAlphaPeriod ? ', 등록 시 차감' : ''})
                </span>
              ) : null}
              {isAlphaPeriod ? (
                <span className="mt-1 block text-amber-800 dark:text-amber-300">
                  알파 버전에서는 Show 등록 시에 Fuel 차감되지 않습니다.
                </span>
              ) : null}
              {placements.length > 1 && (
                <span className="block text-primary/90">
                  인접 페이지에 연결되어 표시됩니다
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto px-5 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="show-title">서비스명 *</Label>
            <Input
              id="show-title"
              name="title"
              maxLength={60}
              required
              placeholder="서비스 이름"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="show-category">구분 *</Label>
            <select
              id="show-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ShowTileCategory)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
            >
              {SHOW_CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {SHOW_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="show-tagline">간략한 소개 *</Label>
            <Textarea
              id="show-tagline"
              name="tagline"
              maxLength={60}
              required
              rows={2}
              placeholder="한 줄로 소개"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="show-imageUrl">이미지 URL</Label>
            <Input
              id="show-imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://…"
            />
            <p className="text-xs text-muted-foreground">
              대표 이미지 URL (http/https). 아이콘만 쓸 경우 비워 두세요.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="show-iconText">아이콘 (이모지)</Label>
            <Input
              id="show-iconText"
              name="iconText"
              maxLength={8}
              placeholder="예: 🚀"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="show-linkUrl">바로가기 *</Label>
            <Input
              id="show-linkUrl"
              name="linkUrl"
              type="url"
              required
              placeholder="https://…"
              onChange={() => setLinkUrlError(null)}
            />
            {linkUrlError && (
              <p className="text-sm text-destructive" role="alert">
                {linkUrlError}
              </p>
            )}
          </div>

          {error && (
            <p
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex gap-2 pb-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              취소
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? '등록 중…' : '등록'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
