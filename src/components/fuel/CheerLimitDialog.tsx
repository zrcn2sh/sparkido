'use client'

import { Button } from '@/components/ui/button'
import { cheerSparkDailyLimitMessage } from '@/lib/spark-cheer-shared'

type CheerLimitDialogProps = {
  open: boolean
  maxPerDay: number
  onClose: () => void
}

export function CheerLimitDialog({
  open,
  maxPerDay,
  onClose,
}: CheerLimitDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cheer-limit-title"
      aria-describedby="cheer-limit-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-hairline bg-card p-6 shadow-linear">
        <p
          id="cheer-limit-title"
          className="text-center text-sm font-medium text-foreground"
        >
          응원 한도 안내
        </p>
        <p
          id="cheer-limit-desc"
          className="mt-3 text-center text-sm leading-relaxed text-muted-foreground"
        >
          {cheerSparkDailyLimitMessage(maxPerDay)}
        </p>
        <Button type="button" className="mt-6 w-full" onClick={onClose}>
          확인
        </Button>
      </div>
    </div>
  )
}
