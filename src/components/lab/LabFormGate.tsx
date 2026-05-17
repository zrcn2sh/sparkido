'use client'

import { SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { LabForm } from '@/components/lab/LabForm'
import { Card, CardContent } from '@/components/ui/card'

type LabFormGateProps = {
  sparkId: string
  canWrite: boolean
  isSignedIn: boolean
}

export function LabFormGate({ sparkId, canWrite, isSignedIn }: LabFormGateProps) {
  if (canWrite) {
    return <LabForm sparkId={sparkId} />
  }

  if (!isSignedIn) {
    return (
      <Card className="mt-10 border-hairline shadow-linear">
        <CardContent className="flex flex-col items-start gap-3 pt-6 text-sm text-muted-foreground">
          <p>Lab 기록을 남기려면 로그인이 필요합니다.</p>
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
            <SignInButton mode="redirect">
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
              >
                로그인하기
              </button>
            </SignInButton>
          ) : (
            <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">
              로그인하기
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <p className="mt-10 text-sm text-muted-foreground">
      Solo Spark는 작성자만 Lab을 추가할 수 있습니다.
    </p>
  )
}
