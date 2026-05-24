'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { SHOW_CATEGORY_LABELS } from '@/lib/show-labels'
import { resolveSparkPath } from '@/lib/routes'
import { dispatchUserFuelChanged } from '@/lib/user-fuel-events'
import type { ShowTile, ShowTileCancelQuote } from '@/types/show'
import { useAuth } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { ExternalLink, Star, ThumbsUp, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type ShowTileModalProps = {
  tile: ShowTile | null
  host: string
  onClose: () => void
  onCanceled?: () => void
}

export function ShowTileModal({
  tile,
  host,
  onClose,
  onCanceled,
}: ShowTileModalProps) {
  const router = useRouter()
  const { isSignedIn, userId } = useAuth()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quote, setQuote] = useState<ShowTileCancelQuote | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [cancelPending, setCancelPending] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [triedCount, setTriedCount] = useState(0)
  const [recommendCount, setRecommendCount] = useState(0)
  const [userHasTried, setUserHasTried] = useState(false)
  const [userHasRecommended, setUserHasRecommended] = useState(false)
  const [reactionPending, setReactionPending] = useState<
    'tried' | 'recommend' | null
  >(null)
  const [reactionError, setReactionError] = useState<string | null>(null)

  const isOwner =
    !!isSignedIn && !!userId && !!tile && tile.ownerId === userId
  const canReact = !!isSignedIn && !!tile && !isOwner

  useEffect(() => {
    if (!tile) return
    setTriedCount(tile.triedCount)
    setRecommendCount(tile.recommendCount)
    setUserHasTried(tile.userHasTried === true)
    setUserHasRecommended(tile.userHasRecommended === true)
    setReactionError(null)
  }, [tile])

  const sparkHref = useMemo(() => {
    if (!tile?.sparkId) return null
    return resolveSparkPath(`/${tile.sparkId}`, host)
  }, [tile?.sparkId, host])

  const loadQuote = useCallback(async () => {
    if (!tile) return
    setQuoteLoading(true)
    setQuoteError(null)
    try {
      const res = await fetch(
        `/api/show/tiles/${encodeURIComponent(tile.id)}/cancel-quote`,
      )
      const data = (await res.json()) as {
        quote?: ShowTileCancelQuote
        error?: string
      }
      if (!res.ok) {
        setQuote(null)
        setQuoteError(data.error ?? '환불 정보를 불러오지 못했습니다.')
        return
      }
      setQuote(data.quote ?? null)
    } catch {
      setQuote(null)
      setQuoteError('네트워크 오류가 발생했습니다.')
    } finally {
      setQuoteLoading(false)
    }
  }, [tile])

  useEffect(() => {
    if (!cancelOpen || !tile) return
    void loadQuote()
  }, [cancelOpen, tile, loadQuote])

  function closeCancelDialog() {
    if (cancelPending) return
    setCancelOpen(false)
    setQuote(null)
    setQuoteError(null)
    setCancelError(null)
  }

  function openCancelDialog() {
    setCancelError(null)
    setCancelOpen(true)
  }

  async function handleReaction(type: 'tried' | 'recommend') {
    if (!tile || !canReact || reactionPending) return
    setReactionPending(type)
    setReactionError(null)
    try {
      const res = await fetch(
        `/api/show/tiles/${encodeURIComponent(tile.id)}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        },
      )
      const data = (await res.json()) as {
        error?: string
        triedCount?: number
        recommendCount?: number
        userHasTried?: boolean
        userHasRecommended?: boolean
      }
      if (!res.ok) {
        setReactionError(data.error ?? '저장에 실패했습니다.')
        return
      }
      setTriedCount(data.triedCount ?? triedCount)
      setRecommendCount(data.recommendCount ?? recommendCount)
      setUserHasTried(data.userHasTried === true)
      setUserHasRecommended(data.userHasRecommended === true)
      router.refresh()
    } catch {
      setReactionError('네트워크 오류가 발생했습니다.')
    } finally {
      setReactionPending(null)
    }
  }

  async function handleConfirmCancel() {
    if (!tile) return
    setCancelPending(true)
    setCancelError(null)
    try {
      const res = await fetch(
        `/api/show/tiles/${encodeURIComponent(tile.id)}/cancel`,
        { method: 'POST' },
      )
      const data = (await res.json()) as {
        error?: string
        quote?: ShowTileCancelQuote
      }
      if (!res.ok) {
        setCancelError(data.error ?? '게시 취소에 실패했습니다.')
        return
      }
      dispatchUserFuelChanged()
      setCancelOpen(false)
      onClose()
      onCanceled?.()
      router.refresh()
    } catch {
      setCancelError('네트워크 오류가 발생했습니다.')
    } finally {
      setCancelPending(false)
    }
  }

  if (!tile) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="show-tile-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/55"
          aria-label="닫기"
          onClick={onClose}
        />
        <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-hairline bg-card shadow-linear sm:rounded-xl">
          <div className="relative shrink-0 border-b border-border bg-muted/30">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/55"
              aria-label="닫기"
            >
              <X className="size-4" />
            </button>
            <div className="flex min-h-[8rem] items-center justify-center px-4 py-4 sm:min-h-[10rem]">
              {tile.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tile.imageUrl}
                  alt=""
                  className="h-auto max-h-[min(50vh,20rem)] w-auto max-w-full object-contain"
                />
              ) : tile.iconText ? (
                <span
                  className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 text-5xl sm:size-28"
                  aria-hidden
                >
                  {tile.iconText}
                </span>
              ) : (
                <div
                  className="size-24 rounded-2xl bg-gradient-to-br from-stone-600 to-stone-800 sm:size-28"
                  aria-hidden
                />
              )}
            </div>
          </div>

          <div className="overflow-y-auto px-5 py-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {SHOW_CATEGORY_LABELS[tile.category]}
              </span>
            </div>
            <h2
              id="show-tile-title"
              className="mt-2 text-xl font-semibold tracking-tight"
            >
              {tile.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{tile.tagline}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              만든 사람{' '}
              <span className="font-medium text-foreground">
                {tile.ownerNickname}
              </span>
            </p>
            {tile.placementGroupId && (
              <p className="mt-2 text-xs text-primary/90">
                여러 페이지에 걸쳐 배치된 타일입니다
              </p>
            )}

            {tile.sparkId && tile.sparkTitle && sparkHref && (
              <p className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                <span className="text-muted-foreground">
                  이 아이디어에서 출발했습니다
                </span>
                <a
                  href={sparkHref}
                  className="mt-1 block font-medium text-primary underline-offset-2 hover:underline"
                >
                  {tile.sparkTitle} →
                </a>
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex shrink-0 items-center">
                {(tile.linkUrl || tile.siteUrl || tile.appStoreUrl) && (
                  <a
                    href={tile.linkUrl ?? tile.siteUrl ?? tile.appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    바로가기
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={userHasTried ? 'default' : 'outline'}
                  className={cn(userHasTried && 'gap-1')}
                  disabled={!canReact || reactionPending !== null}
                  aria-pressed={userHasTried}
                  onClick={() => void handleReaction('tried')}
                >
                  <Star
                    className={cn(
                      'size-3.5',
                      userHasTried && 'fill-amber-300 text-amber-400',
                    )}
                    aria-hidden
                  />
                  써봤어요
                  {triedCount > 0 ? (
                    <span className="font-mono tabular-nums">{triedCount}</span>
                  ) : null}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={userHasRecommended ? 'default' : 'outline'}
                  className={cn(userHasRecommended && 'gap-1')}
                  disabled={!canReact || reactionPending !== null}
                  aria-pressed={userHasRecommended}
                  onClick={() => void handleReaction('recommend')}
                >
                  <ThumbsUp
                    className={cn(
                      'size-3.5',
                      userHasRecommended && 'fill-current',
                    )}
                    aria-hidden
                  />
                  추천해요
                  {recommendCount > 0 ? (
                    <span className="font-mono tabular-nums">
                      {recommendCount}
                    </span>
                  ) : null}
                </Button>
              </div>
            </div>
            {!isSignedIn && (
              <p className="mt-2 text-xs text-muted-foreground">
                로그인 후 써봤어요·추천해요를 남길 수 있습니다.
              </p>
            )}
            {isOwner && (
              <p className="mt-2 text-xs text-muted-foreground">
                본인이 등록한 타일에는 반응할 수 없습니다.
              </p>
            )}
            {reactionError && (
              <p className="mt-2 text-xs text-destructive" role="alert">
                {reactionError}
              </p>
            )}
            {reactionPending && (
              <p className="mt-2 text-xs text-muted-foreground">저장 중…</p>
            )}

            {isOwner && (
              <div className="mt-6 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={openCancelDialog}
                >
                  게시 취소
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {cancelOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="show-cancel-title"
          aria-describedby="show-cancel-desc"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="닫기"
            disabled={cancelPending}
            onClick={closeCancelDialog}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-hairline bg-card p-6 shadow-linear">
            <p
              id="show-cancel-title"
              className="text-center text-base font-semibold"
            >
              게시 취소
            </p>
            <p
              id="show-cancel-desc"
              className="mt-3 text-center text-sm leading-relaxed text-muted-foreground"
            >
              타일을 Show에서 내리면 되돌릴 수 없습니다.
              <br />
              <span className="text-foreground">
                등록 당일은 사용한 것으로 간주
              </span>
              하며, 남은 일수에 대해서만 Fuel을 환불합니다.
            </p>

            {quoteLoading && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                환불 Fuel을 계산하는 중…
              </p>
            )}

            {quoteError && (
              <p className="mt-4 text-center text-sm text-destructive" role="alert">
                {quoteError}
              </p>
            )}

            {quote && !quoteLoading && (
              <div className="mt-4 rounded-md border border-border bg-muted/30 px-4 py-3 text-sm">
                <p className="tabular-nums">
                  사용 일수:{' '}
                  <span className="font-medium text-foreground">
                    {quote.usedDays}일
                  </span>
                  <span className="text-muted-foreground">
                    {' '}
                    / 등록 시 잔여 {quote.remainingDaysAtRegister}일
                  </span>
                </p>
                <p className="mt-2 tabular-nums">
                  미사용 일수:{' '}
                  <span className="font-medium text-foreground">
                    {quote.unusedDays}일
                  </span>
                  <span className="text-muted-foreground">
                    {' '}
                    (일 ⚡ {quote.dailyFuel})
                  </span>
                </p>
                <p className="mt-3 text-base font-medium text-foreground">
                  환불 가능 Fuel:{' '}
                  <span className="font-mono text-primary">
                    ⚡ {quote.refundAmount}
                  </span>
                </p>
                {quote.refundAmount === 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    당일 취소 등으로 환불할 Fuel이 없습니다.
                  </p>
                )}
              </div>
            )}

            {cancelError && (
              <p className="mt-3 text-center text-sm text-destructive" role="alert">
                {cancelError}
              </p>
            )}

            <div className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={cancelPending}
                onClick={closeCancelDialog}
              >
                닫기
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={cancelPending || quoteLoading || !!quoteError}
                onClick={() => void handleConfirmCancel()}
              >
                {cancelPending ? '처리 중…' : '게시 취소'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
