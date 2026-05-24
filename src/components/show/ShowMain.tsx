'use client'

import { ShowRegisterDialog } from '@/components/show/ShowRegisterDialog'
import { ShowViewport } from '@/components/show/ShowViewport'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  getSelectionErrorMessage,
  selectionToPlacements,
  toggleSelectionCell,
  type ShowGridPlacement,
  type ShowGridSelectionCell,
} from '@/lib/show-selection'
import {
  quoteShowSelectionFuel,
  type ShowPublicConfig,
  type ShowTileSizeLimits,
} from '@/lib/show-config'
import type { ShowPage } from '@/types/show'
import { cn } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

type ShowMainProps = {
  pages: ShowPage[]
  host: string
  loadError?: string | null
}

export function ShowMain({ pages, host, loadError }: ShowMainProps) {
  const { isSignedIn } = useAuth()
  const [selectedCells, setSelectedCells] = useState<ShowGridSelectionCell[]>([])
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null)
  const [registerPlacements, setRegisterPlacements] = useState<
    ShowGridPlacement[] | null
  >(null)
  const [showConfig, setShowConfig] = useState<ShowPublicConfig | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/show/fuel-rates')
        const data = (await res.json()) as Partial<ShowPublicConfig>
        if (!cancelled && res.ok && data.rates && data.sizeLimits) {
          setShowConfig({
            rates: data.rates,
            sizeLimits: data.sizeLimits,
            remainingDaysInMonth: data.remainingDaysInMonth ?? 0,
            isAlphaPeriod: data.isAlphaPeriod === true,
          })
        }
      } catch {
        /* 견적·크기 검증 생략 */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const sizeLimits: ShowTileSizeLimits | undefined =
    showConfig?.sizeLimits

  const fuelQuote = useMemo(
    () =>
      showConfig
        ? quoteShowSelectionFuel(
            selectedCells,
            showConfig.rates,
            showConfig.sizeLimits,
            showConfig.remainingDaysInMonth,
          )
        : null,
    [selectedCells, showConfig],
  )

  const handleToggleCell = useCallback((cell: ShowGridSelectionCell) => {
    setSelectionMessage(null)
    setSelectedCells((prev) => toggleSelectionCell(prev, cell))
  }, [])

  function handleOpenRegister() {
    const err = getSelectionErrorMessage(selectedCells, sizeLimits)
    if (err) {
      setSelectionMessage(err)
      return
    }
    const placements = selectionToPlacements(selectedCells)
    if (!placements) {
      setSelectionMessage(getSelectionErrorMessage(selectedCells, sizeLimits))
      return
    }
    setSelectionMessage(null)
    setRegisterPlacements(placements)
  }

  function handleRegisterSuccess() {
    setSelectedCells([])
    setSelectionMessage(null)
  }

  function handleClearSelection() {
    setSelectedCells([])
    setSelectionMessage(null)
  }

  return (
    <div className="flex flex-col">
      <div className="flex shrink-0 flex-col gap-2 border-b border-[#E8E6DF] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            사용자가 만든 서비스 및 앱을 보여주는 쇼케이스 광장
          </p>
          {isSignedIn && (
            <p className="mt-1 text-xs text-muted-foreground">
              * 빈 칸을 눌러 영역을 선택합니다.
              {sizeLimits ? (
                <>
                  {' '}
                  등록 크기는{' '}
                  <strong className="font-medium text-foreground">
                    1×1 ~ {sizeLimits.maxCols}×{sizeLimits.maxRows}
                  </strong>
                  입니다.
                </>
              ) : null}{' '}
              P1과 P2처럼 이웃한 페이지를 가로로 이어 선택할 수 있습니다.
              {showConfig?.isAlphaPeriod ? (
                <>
                  {' '}
                  <strong className="font-medium text-foreground">
                    알파 기간
                  </strong>
                  — Show Fuel은 차감되지 않습니다.
                </>
              ) : showConfig ? (
                <>
                  {' '}
                  Fuel은 <strong className="font-medium text-foreground">1일
                  단가×당월 잔여일</strong>
                  (KST, 등록일 포함)입니다.
                </>
              ) : null}
            </p>
          )}
        </div>
        {isSignedIn ? (
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenRegister}
                disabled={selectedCells.length === 0}
              >
                타일 등록
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={selectedCells.length === 0}
              >
              타일 초기화
            </Button>
            </div>
            <p
              className="text-sm text-muted-foreground tabular-nums"
              aria-live="polite"
            >
              사용 Fuel{' '}
              {fuelQuote ? (
                <>
                  <span className="font-medium text-foreground">
                    일 ⚡ {fuelQuote.dailyFuel}
                  </span>
                  <span className="text-xs">
                    {' '}
                    · 이번 달 ⚡ {fuelQuote.periodFuel} (
                    {fuelQuote.remainingDays}일) · {fuelQuote.cellCount}칸 (
                    {fuelQuote.width}×{fuelQuote.height})
                    {showConfig?.isAlphaPeriod ? (
                      <span className="text-amber-800 dark:text-amber-300">
                        {' '}
                        · 알파(차감 없음)
                      </span>
                    ) : null}
                  </span>
                </>
              ) : selectedCells.length > 0 ? (
                <span className="text-foreground/70">—</span>
              ) : (
                <span className="text-foreground/50">—</span>
              )}
            </p>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            로그인 후 등록
          </Link>
        )}
      </div>

      {loadError && (
        <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {selectionMessage && (
        <p
          className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground"
          role="alert"
        >
          {selectionMessage}
        </p>
      )}

      <ShowViewport
        pages={pages}
        host={host}
        selectionEnabled={!!isSignedIn}
        selectedCells={selectedCells}
        onToggleCell={handleToggleCell}
      />

      {registerPlacements && (
        <ShowRegisterDialog
          open
          placements={registerPlacements}
          fuelQuote={fuelQuote}
          isAlphaPeriod={showConfig?.isAlphaPeriod === true}
          onClose={() => setRegisterPlacements(null)}
          onSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  )
}
