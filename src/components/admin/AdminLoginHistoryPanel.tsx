'use client'

import { useCallback, useEffect, useState } from 'react'
import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatKstDateTime } from '@/lib/datetime'
import { cn } from '@/lib/utils'

type HistoryEntry = {
  id: string
  source: 'd1' | 'clerk'
  kind: 'sign_in' | 'sign_out' | 'session'
  eventType: string
  label: string
  occurredAt: string
  signedOutAt: string | null
  ipAddress: string | null
  browser: string | null
  userAgent: string | null
  location: string | null
  clerkSessionId: string | null
}

type HistoryResponse = {
  entries: HistoryEntry[]
  dataSource: 'd1' | 'clerk'
  lastSignInAt: string | null
  error?: string
}

type AdminLoginHistoryPanelProps = {
  open: boolean
  onClose: () => void
  clerkUserId: string
  nickname: string
}

export function AdminLoginHistoryPanel({
  open,
  onClose,
  clerkUserId,
  nickname,
}: AdminLoginHistoryPanelProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [slideIn, setSlideIn] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(clerkUserId)}/login-events`,
      )
      const json = (await res.json()) as HistoryResponse & { error?: string }
      if (!res.ok) {
        setError(json.error ?? '로그인 이력을 불러오지 못했습니다.')
        setData(null)
        return
      }
      setData(json)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [clerkUserId])

  useEffect(() => {
    if (!open) {
      setSlideIn(false)
      return
    }
    void load()
    const frame = requestAnimationFrame(() => setSlideIn(true))
    return () => cancelAnimationFrame(frame)
  }, [open, load])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/40 transition-opacity duration-300',
          slideIn ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="패널 닫기"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-history-title"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out',
          slideIn ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id="login-history-title" className="text-lg font-semibold">
              로그인 이력
            </h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {nickname}
            </p>
            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
              {clerkUserId}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="닫기"
            onClick={onClose}
          >
            <XIcon />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <p className="text-sm text-muted-foreground">불러오는 중…</p>
          )}
          {!loading && error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {!loading && !error && data && (
            <>
              {data.dataSource === 'clerk' && (
                <p className="mb-4 text-xs text-muted-foreground">
                  D1에 저장된 이력이 없어 Clerk 세션 정보로 표시합니다.
                  {data.lastSignInAt && (
                    <>
                      {' '}
                      마지막 로그인:{' '}
                      {formatKstDateTime(data.lastSignInAt)}
                    </>
                  )}
                </p>
              )}
              {data.dataSource === 'd1' && (
                <p className="mb-4 text-xs text-muted-foreground">
                  Clerk Webhook으로 수집된 로그인·로그아웃 기록입니다.
                </p>
              )}
              {data.entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  표시할 로그인 이력이 없습니다. Clerk Webhook(
                  <code className="text-xs">session.created</code>,{' '}
                  <code className="text-xs">session.ended</code>) 연결 후
                  신규 로그인부터 기록됩니다.
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.entries.map((entry) => (
                    <li
                      key={`${entry.source}-${entry.id}`}
                      className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                            entry.kind === 'sign_in' &&
                              'bg-primary/15 text-primary',
                            entry.kind === 'sign_out' &&
                              'bg-muted text-muted-foreground',
                            entry.kind === 'session' &&
                              'bg-secondary text-secondary-foreground',
                          )}
                        >
                          {entry.label}
                        </span>
                        <time className="text-muted-foreground">
                          {formatKstDateTime(entry.occurredAt)}
                        </time>
                      </div>
                      {entry.signedOutAt && entry.kind !== 'sign_out' && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          종료: {formatKstDateTime(entry.signedOutAt)}
                        </p>
                      )}
                      {(entry.ipAddress ||
                        entry.browser ||
                        entry.location ||
                        entry.userAgent) && (
                        <dl className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                          {entry.ipAddress && (
                            <div>
                              <dt className="inline font-medium">IP </dt>
                              <dd className="inline">{entry.ipAddress}</dd>
                            </div>
                          )}
                          {entry.browser && (
                            <div>
                              <dt className="inline font-medium">브라우저 </dt>
                              <dd className="inline">{entry.browser}</dd>
                            </div>
                          )}
                          {entry.location && (
                            <div>
                              <dt className="inline font-medium">위치 </dt>
                              <dd className="inline">{entry.location}</dd>
                            </div>
                          )}
                        </dl>
                      )}
                      {entry.clerkSessionId && (
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground/80">
                          {entry.clerkSessionId}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
