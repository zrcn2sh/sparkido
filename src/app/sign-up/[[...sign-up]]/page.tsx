export const runtime = 'edge'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 text-sm text-muted-foreground">
        .env.local에 Clerk 키를 설정해 주세요.
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 py-12">
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        계정 생성 후 별명을 등록하면 Spark·Lab·게시판에 표시됩니다.
      </p>
      <SignUp forceRedirectUrl="/" fallbackRedirectUrl="/" />
    </div>
  )
}
