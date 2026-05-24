'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPanel } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'

type AdminShowPurgePanelProps = {
  activeTileCount: number
}

export function AdminShowPurgePanel({
  activeTileCount,
}: AdminShowPurgePanelProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRemoved, setLastRemoved] = useState<number | null>(null)

  function closeDialog() {
    if (pending) return
    setDialogOpen(false)
    setError(null)
  }

  async function handlePurge() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/show/tiles', { method: 'DELETE' })
      const data = (await res.json()) as { error?: string; removed?: number }
      if (!res.ok) {
        setError(data.error ?? '타일 전체 삭제에 실패했습니다.')
        return
      }
      setLastRemoved(data.removed ?? 0)
      setDialogOpen(false)
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <AdminPanel className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Show 쇼케이스에 등록된 <strong className="text-foreground">활성 타일</strong>
          을 모두 제거합니다. DB에서는 비활성(removed) 처리되며, Fuel 환불 정책은 별도 적용 예정입니다.
        </p>
        <p className="text-sm">
          현재 활성 타일:{' '}
          <span className="font-mono font-medium tabular-nums">
            {activeTileCount}개
          </span>
        </p>
        {lastRemoved != null && (
          <p className="text-sm text-primary" role="status">
            마지막 삭제: {lastRemoved}개 타일을 제거했습니다.
          </p>
        )}
        <Button
          type="button"
          variant="destructive"
          disabled={activeTileCount === 0}
          onClick={() => {
            setError(null)
            setDialogOpen(true)
          }}
        >
          Show 타일 전체 삭제
        </Button>
        {activeTileCount === 0 && (
          <p className="text-xs text-muted-foreground">
            삭제할 활성 타일이 없습니다.
          </p>
        )}
      </AdminPanel>

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="show-purge-title"
          aria-describedby="show-purge-desc"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="닫기"
            disabled={pending}
            onClick={closeDialog}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-destructive/30 bg-card p-6 shadow-linear">
            <p
              id="show-purge-title"
              className="text-center text-base font-semibold text-destructive"
            >
              Show 타일 전체 삭제
            </p>
            <p
              id="show-purge-desc"
              className="mt-4 text-center text-sm leading-relaxed text-foreground"
            >
              <strong>활성 타일 {activeTileCount}개</strong>가 모두 삭제됩니다.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
              <li>모든 사용자의 Show 타일이 그리드에서 사라집니다.</li>
              <li>이 작업은 되돌릴 수 없습니다.</li>
              <li>매월 1일 자동 삭제(Cron)와 동일한 결과입니다.</li>
            </ul>
            <p className="mt-4 text-center text-sm font-medium text-foreground">
              정말 전체 삭제하시겠습니까?
            </p>
            {error && (
              <p
                className="mt-3 text-center text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={pending}
                onClick={closeDialog}
              >
                취소
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={pending}
                onClick={() => void handlePurge()}
              >
                {pending ? '삭제 중…' : '전체 삭제'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
