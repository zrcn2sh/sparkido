'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { Suspense } from 'react'
import { NicknameRegistrationPrompt } from '@/components/auth/NicknameRegistrationPrompt'
import { AuthFuelRewardToasts } from '@/components/fuel/AuthFuelRewardToasts'

type AppProvidersProps = {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    return <>{children}</>
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
