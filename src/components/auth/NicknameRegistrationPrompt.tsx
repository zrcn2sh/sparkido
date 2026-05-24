'use client'

import { useAuth } from '@clerk/nextjs'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const DECLINED_KEY = 'nickname-prompt-declined'

const SKIP_PREFIXES = [
  '/sign-in',
  '/sign-up',
  '/onboarding',
  '/settings',
]

function shouldSkipPath(pathname: string) {
  return SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function NicknameRegistrationPrompt() {
  const { isSignedIn, isLoaded } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)

  const returnBack = `${pathname}${searchParams.toString() ? `?${searchParams}` : ''}`

  const checkProfile = useCallback(async () => {
    if (!isLoaded || !isSignedIn || shouldSkipPath(pathname)) {
      setOpen(false)
      setChecked(true)
      return
    }

    if (sessionStorage.getItem(DECLINED_KEY) === '1') {
      setOpen(false)
      setChecked(true)
      return
    }

    try {
      const res = await fetch('/api/users/me/nickname')
      if (!res.ok) {
        setOpen(false)
        return
      }
      const data = (await res.json()) as { profile?: { nickname: string } | null }
      setOpen(!data.profile?.nickname)
    } catch {
      setOpen(false)
    } finally {
      setChecked(true)
    }
  }, [isLoaded, isSignedIn, pathname])

  useEffect(() => {
    setChecked(false)
    void checkProfile()
  }, [checkProfile])

  function handleNo() {
    sessionStorage.setItem(DECLINED_KEY, '1')
    setOpen(false)
  }

  function handleYes() {
    const url = `/onboarding/nickname?returnBack=${encodeURIComponent(returnBack)}`
    router.push(url)
  }

  if (!checked || !open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={handleNo}
    >
      <div
        role="alertdialog"
        aria-labelledby="nickname-prompt-title"
        aria-describedby="nickname-prompt-desc"
        className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="nickname-prompt-title" className="text-lg font-semibold">
          별명 등록
        </h2>
        <p
          id="nickname-prompt-desc"
          className="mt-3 text-sm text-muted-foreground"
        >
          별명이 등록되지 않았습니다. 등록하시겠습니까?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleNo}>
            아니오
          </Button>
          <Button type="button" onClick={handleYes}>
            예
          </Button>
        </div>
      </div>
    </div>
  )
}
