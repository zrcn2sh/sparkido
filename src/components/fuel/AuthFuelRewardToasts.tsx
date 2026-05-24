'use client'

import { SignedIn } from '@clerk/nextjs'
import { LoginFuelRewardToast } from '@/components/fuel/LoginFuelRewardToast'
import {
  SignupFuelRewardDialog,
  fetchSignupFuelToast,
  requestEarnSignupFuel,
} from '@/components/fuel/SignupFuelRewardToast'
import { dispatchUserFuelChanged } from '@/lib/user-fuel-events'
import { useCallback, useEffect, useRef, useState } from 'react'

const SIGNUP_POLL_MS = [0, 800, 2000, 5000]

type SignupPayload = { amount: number; ledgerId: string }

function AuthFuelRewardToastsInner() {
  const [signupPayload, setSignupPayload] = useState<SignupPayload | null>(null)
  const [signupDone, setSignupDone] = useState(false)
  const signupPollDone = useRef(false)

  const pollSignupToast = useCallback(async (): Promise<boolean> => {
    const { payload } = await fetchSignupFuelToast()
    if (payload) {
      setSignupPayload(payload)
      dispatchUserFuelChanged()
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (signupPollDone.current) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []

    void (async () => {
      await requestEarnSignupFuel()
      let prev = 0
      for (const targetMs of SIGNUP_POLL_MS) {
        if (cancelled || signupPollDone.current) return
        const wait = targetMs - prev
        prev = targetMs
        if (wait > 0) {
          await new Promise<void>((resolve) => {
            timers.push(setTimeout(resolve, wait))
          })
        }
        if (cancelled || signupPollDone.current) return
        if (await pollSignupToast()) {
          signupPollDone.current = true
          return
        }
      }
      signupPollDone.current = true
      setSignupDone(true)
    })()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [pollSignupToast])

  function handleSignupDismissed() {
    setSignupPayload(null)
    setSignupDone(true)
  }

  const showLoginToast = signupDone && !signupPayload

  return (
    <>
      {signupPayload ? (
        <SignupFuelRewardDialog
          amount={signupPayload.amount}
          ledgerId={signupPayload.ledgerId}
          onDismissed={handleSignupDismissed}
        />
      ) : null}
      {showLoginToast ? <LoginFuelRewardToast /> : null}
    </>
  )
}

export function AuthFuelRewardToasts() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return null

  return (
    <SignedIn>
      <AuthFuelRewardToastsInner />
    </SignedIn>
  )
}
