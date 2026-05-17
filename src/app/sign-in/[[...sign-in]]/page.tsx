import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 text-sm text-muted-foreground">
        .env.local에 Clerk 키를 설정해 주세요.
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <SignIn />
    </div>
  )
}
