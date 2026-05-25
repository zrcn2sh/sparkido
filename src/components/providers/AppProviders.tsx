'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { Suspense } from 'react'
import { NicknameRegistrationPrompt } from '@/components/auth/NicknameRegistrationPrompt'
import { AuthFuelRewardToasts } from '@/components/fuel/AuthFuelRewardToasts'
import { ClerkSetupRequired } from '@/components/providers/ClerkSetupRequired'

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

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignUpUrl="/"
    >
      {children}
      <Suspense fallback={null}>
        <NicknameRegistrationPrompt />
        <AuthFuelRewardToasts />
      </Suspense>
    </ClerkProvider>
  )
}
