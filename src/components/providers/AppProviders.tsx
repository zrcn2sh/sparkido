'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { Suspense } from 'react'
import { NicknameRegistrationPrompt } from '@/components/auth/NicknameRegistrationPrompt'
import { AuthFuelRewardToasts } from '@/components/fuel/AuthFuelRewardToasts'
import { ClerkSetupRequired } from '@/components/providers/ClerkSetupRequired'
import {
  getClerkAllowedOrigins,
  getClerkSignInUrl,
  getClerkSignUpUrl,
} from '@/lib/clerk-origins'

type AppProvidersProps = {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? ''

  if (!publishableKey) {
    if (process.env.NODE_ENV === 'development') {
      return <>{children}</>
    }
    return <ClerkSetupRequired />
  }

  const allowedRedirectOrigins = getClerkAllowedOrigins()

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl={getClerkSignInUrl()}
      signUpUrl={getClerkSignUpUrl()}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignUpUrl="/"
      {...(allowedRedirectOrigins.length > 0
        ? { allowedRedirectOrigins }
        : {})}
    >
      {children}
      <Suspense fallback={null}>
        <NicknameRegistrationPrompt />
        <AuthFuelRewardToasts />
      </Suspense>
    </ClerkProvider>
  )
}
