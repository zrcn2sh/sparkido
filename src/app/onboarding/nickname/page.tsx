export const runtime = 'edge'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { NicknameProfilePanel } from '@/components/auth/NicknameProfilePanel'
import { tryEarnSignupFuelForUser } from '@/lib/fuel-auth-rewards'
import { hasUserProfile } from '@/lib/user-profile'

export const dynamic = 'force-dynamic'

type NicknameOnboardingPageProps = {
  searchParams: { returnBack?: string }
}

export default async function NicknameOnboardingPage({
  searchParams,
}: NicknameOnboardingPageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in?redirect_url=/onboarding/nickname')
  }

  const returnBack = searchParams.returnBack?.startsWith('/')
    ? searchParams.returnBack
    : '/spark'

  if (await hasUserProfile(userId)) {
    redirect(returnBack)
  }

  await tryEarnSignupFuelForUser(userId)

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold">별명 설정</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        가입을 환영합니다. 서비스에서 사용할 별명을 등록해 주세요.
      </p>
      <div className="mt-8">
        <NicknameProfilePanel mode="page" returnBackUrl={returnBack} />
      </div>
    </div>
  )
}
