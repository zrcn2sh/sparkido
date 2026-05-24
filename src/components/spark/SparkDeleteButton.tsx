'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type SparkDeleteButtonProps = {
  sparkId: string
  listPath: string
}

export function SparkDeleteButton({ sparkId, listPath }: SparkDeleteButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function closeDialog() {
    if (pending) return
    setOpen(false)
    setError(null)
  }

  async function handleDelete() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/sparks/${encodeURIComponent(sparkId)}`,
        { method: 'DELETE' },
      )
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? '삭제에 실패했습니다.')
        return
      }
      setOpen(false)
      router.push(listPath)
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        Spark 삭제
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="spark-delete-title"
          aria-describedby="spark-delete-desc"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="닫기"
            disabled={pending}
            onClick={closeDialog}
          />
          <div className="relative z-10 w-full max-w-sm rounded-lg border border-hairline bg-card p-6 shadow-linear">
            <p
              id="spark-delete-title"
              className="text-center text-sm font-medium text-foreground"
            >
              Spark 삭제
            </p>
            <p
              id="spark-delete-desc"
              className="mt-3 text-center text-sm leading-relaxed text-muted-foreground"
            >
              이 Spark와 연결된 Lab·응원 기록이 모두 삭제됩니다.
              <br />
              삭제 후에는 되돌릴 수 없습니다. 계속하시겠습니까?
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
                onClick={() => void handleDelete()}
              >
                {pending ? '삭제 중…' : '삭제'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
