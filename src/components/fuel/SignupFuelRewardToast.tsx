'use client'

import { Button } from '@/components/ui/button'
import {
  dismissSignupFuelToast,
  isSignupFuelToastDismissed,
} from '@/lib/signup-fuel-toast-storage'
import { dispatchUserFuelChanged } from '@/lib/user-fuel-events'
import { cn } from '@/lib/utils'
import { PartyPopper } from 'lucide-react'

type SignupToastResponse = {
  show: boolean
  amount: number
  ledgerId: string | null
}

type SignupFuelRewardDialogProps = {
  amount: number
  ledgerId: string
  onDismissed: () => void
}

export function SignupFuelRewardDialog({
  amount,
  ledgerId,
  onDismissed,
}: SignupFuelRewardDialogProps) {
  function handleClose() {
    dismissSignupFuelToast(ledgerId)
    dispatchUserFuelChanged()
    onDismissed()
  }

  return (
    <div
      className="fixed inset-0 z-[61] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-fuel-toast-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="닫기"
        onClick={handleClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-xs overflow-hidden rounded-2xl border-2 border-violet-200/80',
          'bg-gradient-to-b from-violet-50 via-fuchsia-50 to-violet-100/90 p-6 shadow-xl',
          'dark:border-violet-500/40 dark:from-violet-950/90 dark:via-fuchsia-950/80 dark:to-violet-950',
          'animate-in fade-in-0 zoom-in-95 duration-300',
        )}
      >
        <div className="pointer-events-none absolute -right-3 -top-3 text-4xl opacity-50" aria-hidden>
          🎉
        </div>
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-3 flex size-14 items-center justify-center rounded-full bg-violet-200/60 dark:bg-violet-500/20"
            aria-hidden
          >
            <PartyPopper className="size-7 text-violet-600 dark:text-violet-400" />
          </div>
          <p
            id="signup-fuel-toast-title"
            className="text-base font-semibold text-violet-950 dark:text-violet-100"
          >
            가입을 환영해요!
          </p>
          <p className="mt-2 text-sm leading-relaxed text-violet-900/85 dark:text-violet-200/90">
            Idosquare에 오신 걸 축하해요{' '}
            <span className="inline-block" aria-hidden>
              ✨
            </span>
            <br />
            <span className="mt-1 inline-block font-mono text-lg font-bold tabular-nums text-fuchsia-600 dark:text-fuchsia-400">
              +{amount} Fuel
            </span>
            <span className="text-fuchsia-500" aria-hidden>
              {' '}
              ⚡
            </span>
            선물이에요
          </p>
          <p className="mt-1 text-xs text-violet-800/70 dark:text-violet-300/70">
            (회원가입 1회 한정)
          </p>
          <Button
            type="button"
            className="mt-5 w-full rounded-xl bg-violet-500 font-medium text-white hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500"
            onClick={handleClose}
          >
            고마워요!
          </Button>
        </div>
      </div>
    </div>
  )
}

export async function fetchSignupFuelToast(): Promise<{
  payload: { amount: number; ledgerId: string } | null
}> {
  try {
    const res = await fetch('/api/users/me/fuel/signup-toast')
    const data = (await res.json()) as SignupToastResponse
    if (
      !res.ok ||
      !data.show ||
      !data.ledgerId ||
      data.amount <= 0 ||
      isSignupFuelToastDismissed(data.ledgerId)
    ) {
      return { payload: null }
    }
    return { payload: { amount: data.amount, ledgerId: data.ledgerId } }
  } catch {
    return { payload: null }
  }
}

export async function requestEarnSignupFuel(): Promise<void> {
  try {
    await fetch('/api/users/me/fuel/earn-signup', { method: 'POST' })
  } catch {
    /* ignore */
  }
}
