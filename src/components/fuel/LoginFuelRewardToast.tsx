'use client'

import { SignedIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import {
  dismissLoginFuelToast,
  isLoginFuelToastDismissed,
} from '@/lib/login-fuel-toast-storage'
import { dispatchUserFuelChanged } from '@/lib/user-fuel-events'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type LoginToastResponse = {
  show: boolean
  amount: number
  ledgerId: string | null
}

const POLL_DELAYS_MS = [0, 1500, 4000, 8000]

type RewardPayload = {
  amount: number
  ledgerId: string
}

function LoginFuelRewardDialog({
  payload,
  onClose,
}: {
  payload: RewardPayload
  onClose: () => void
}) {
  function handleClose() {
    dismissLoginFuelToast(payload.ledgerId)
    dispatchUserFuelChanged()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-fuel-toast-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="닫기"
        onClick={handleClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-xs overflow-hidden rounded-2xl border-2 border-amber-200/80',
          'bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100/90 p-6 shadow-xl',
          'dark:border-amber-500/40 dark:from-amber-950/90 dark:via-orange-950/80 dark:to-amber-950',
          'animate-in fade-in-0 zoom-in-95 duration-300',
        )}
      >
        <div
          className="pointer-events-none absolute -right-4 -top-4 text-4xl opacity-40"
          aria-hidden
        >
          ✨
        </div>
        <div
          className="pointer-events-none absolute -bottom-2 -left-2 text-3xl opacity-30"
          aria-hidden
        >
          ⚡
        </div>

        <div className="flex flex-col items-center text-center">
          <div
            className="mb-3 flex size-14 items-center justify-center rounded-full bg-amber-200/60 dark:bg-amber-500/20"
            aria-hidden
          >
            <Sparkles className="size-7 text-amber-600 dark:text-amber-400" />
          </div>
          <p
            id="login-fuel-toast-title"
            className="text-base font-semibold text-amber-950 dark:text-amber-100"
          >
            오늘 첫 로그인이에요!
          </p>
          <p className="mt-2 text-sm leading-relaxed text-amber-900/85 dark:text-amber-200/90">
            반가워요{' '}
            <span className="inline-block animate-bounce" aria-hidden>
              👋
            </span>
            <br />
            <span className="mt-1 inline-block font-mono text-lg font-bold tabular-nums text-orange-600 dark:text-orange-400">
              +{payload.amount} Fuel
            </span>
            <span className="text-orange-500" aria-hidden>
              {' '}
              ⚡
            </span>
            이 도착했어요
          </p>
          <p className="mt-1 text-xs text-amber-800/70 dark:text-amber-300/70">
            (하루에 한 번만 받을 수 있어요)
          </p>
          <Button
            type="button"
            className="mt-5 w-full rounded-xl bg-amber-500 font-medium text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
            onClick={handleClose}
          >
            야호! 받았어요
          </Button>
        </div>
      </div>
    </div>
  )
}

function LoginFuelRewardToastInner() {
  const [payload, setPayload] = useState<RewardPayload | null>(null)
  const doneRef = useRef(false)

  const requestEarnLogin = useCallback(async () => {
    try {
      await fetch('/api/users/me/fuel/earn-login', { method: 'POST' })
    } catch {
      /* ignore */
    }
  }, [])

  const tryShow = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/users/me/fuel/login-toast')
      const data = (await res.json()) as LoginToastResponse
      if (
        !res.ok ||
        !data.show ||
        !data.ledgerId ||
        data.amount <= 0 ||
        isLoginFuelToastDismissed(data.ledgerId)
      ) {
        return false
      }
      setPayload({ amount: data.amount, ledgerId: data.ledgerId })
      dispatchUserFuelChanged()
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    if (doneRef.current) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []

    void (async () => {
      await requestEarnLogin()
      let prev = 0
      for (const targetMs of POLL_DELAYS_MS) {
        if (cancelled || doneRef.current) return
        const wait = targetMs - prev
        prev = targetMs
        if (wait > 0) {
          await new Promise<void>((resolve) => {
            timers.push(setTimeout(resolve, wait))
          })
        }
        if (cancelled || doneRef.current) return
        if (await tryShow()) {
          doneRef.current = true
          return
        }
      }
      doneRef.current = true
    })()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [tryShow, requestEarnLogin])

  if (!payload) return null

  return (
    <LoginFuelRewardDialog
      payload={payload}
      onClose={() => setPayload(null)}
    />
  )
}

export function LoginFuelRewardToast() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return null

  return (
    <SignedIn>
      <LoginFuelRewardToastInner />
    </SignedIn>
  )
}
