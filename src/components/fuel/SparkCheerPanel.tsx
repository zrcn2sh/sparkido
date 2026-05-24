'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheerLimitDialog } from '@/components/fuel/CheerLimitDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CheerSparkErrorCode } from '@/lib/spark-cheer-shared'
import { dispatchUserFuelChanged } from '@/lib/user-fuel-events'
import { cn } from '@/lib/utils'

type SparkCheerPanelProps = {
  sparkId: string
  cheerCount: number
  maxCheerPerUserPerSparkDay?: number
  isSignedIn?: boolean
  variant: 'sidebar' | 'mobile'
  className?: string
}

type CheerApiError = {
  error?: string
  code?: CheerSparkErrorCode
  limit?: number
}

function CheerPanelBody({
  sparkId,
  cheerCount,
  isSignedIn,
  onCheer,
  cheering,
}: {
  sparkId: string
  cheerCount: number
  isSignedIn: boolean
  onCheer: () => void
  cheering: boolean
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart
            className="size-3.5 fill-rose-500/20 text-rose-500"
            aria-hidden
          />
          응원 수
        </span>
        <span className="flex items-center gap-1 font-mono text-sm font-medium text-rose-700 dark:text-rose-400">
          <Heart
            className="size-4 fill-rose-500/25 text-rose-500"
            aria-hidden
          />
          {cheerCount}
        </span>
      </div>
      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-center gap-1.5 border-rose-400/35 text-rose-800 hover:bg-rose-50/80 dark:text-rose-300"
          disabled={!isSignedIn || cheering}
          onClick={onCheer}
        >
          <Heart className="size-4 fill-rose-500/20 text-rose-500" />
          응원하기
        </Button>
      </div>
      <span className="sr-only">Spark ID: {sparkId}</span>
    </>
  )
}

export function SparkCheerPanel({
  sparkId,
  cheerCount: initialCheerCount,
  maxCheerPerUserPerSparkDay = 10,
  isSignedIn = false,
  variant,
  className,
}: SparkCheerPanelProps) {
  const router = useRouter()
  const [cheerCount, setCheerCount] = useState(initialCheerCount)
  const [cheering, setCheering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitDialogOpen, setLimitDialogOpen] = useState(false)
  const [limitDialogMax, setLimitDialogMax] = useState(maxCheerPerUserPerSparkDay)

  useEffect(() => {
    setCheerCount(initialCheerCount)
  }, [initialCheerCount])

  async function handleCheer() {
    if (!isSignedIn) return
    setCheering(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/sparks/${encodeURIComponent(sparkId)}/cheer`,
        { method: 'POST' },
      )
      const data = (await res.json()) as CheerApiError & {
        cheerCount?: number
      }
      if (!res.ok) {
        if (data.code === 'spark_daily_cheer_limit') {
          const max =
            typeof data.limit === 'number'
              ? data.limit
              : maxCheerPerUserPerSparkDay
          setLimitDialogMax(max)
          setLimitDialogOpen(true)
          setError(null)
          return
        }
        setError(data.error ?? '응원에 실패했습니다.')
        return
      }
      if (typeof data.cheerCount === 'number') setCheerCount(data.cheerCount)
      dispatchUserFuelChanged()
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setCheering(false)
    }
  }

  const panel = (
    <CheerPanelBody
      sparkId={sparkId}
      cheerCount={cheerCount}
      isSignedIn={isSignedIn}
      onCheer={handleCheer}
      cheering={cheering}
    />
  )

  const limitDialog = (
    <CheerLimitDialog
      open={limitDialogOpen}
      maxPerDay={limitDialogMax}
      onClose={() => setLimitDialogOpen(false)}
    />
  )

  if (variant === 'mobile') {
    return (
      <>
        {limitDialog}
        <details
          className={cn(
            'group rounded-lg border-hairline border border-border bg-card shadow-linear',
            className,
          )}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-1.5 text-rose-800 dark:text-rose-400">
              <Heart className="size-4 fill-rose-500/20 text-rose-500" />
              응원
            </span>
            <span className="font-mono text-xs text-rose-600">{cheerCount}</span>
          </summary>
          <div className="border-t border-border px-4 pb-4 pt-3">
            {panel}
            {error && (
              <p className="mt-2 text-xs text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </details>
      </>
    )
  }

  return (
    <>
      {limitDialog}
      <Card
        className={cn(
          'border-hairline border-border bg-card shadow-linear',
          className,
        )}
      >
        <CardHeader className="gap-1 pb-2">
          <CardTitle className="flex items-center gap-1.5 text-base text-rose-800 dark:text-rose-400">
            <Heart className="size-4 fill-rose-500/20 text-rose-500" />
            응원
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {panel}
          {error && (
            <p className="mt-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
