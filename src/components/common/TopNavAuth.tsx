'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { AppUserMenu } from '@/components/auth/AppUserMenu'
import { UserFuelBadge } from '@/components/fuel/UserFuelBadge'

const authLinkClass =
  'text-sm text-muted-foreground transition-colors hover:text-foreground'

export function TopNavAuth() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <span className="text-xs text-muted-foreground" title="Clerk 키 미설정">
        —
      </span>
    )
  }

  return (
    <>
      <SignedOut>
        <SignInButton mode="redirect">
          <button type="button" className={authLinkClass}>
            로그인
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <UserFuelBadge />
          <AppUserMenu />
        </div>
      </SignedIn>
    </>
  )
}
