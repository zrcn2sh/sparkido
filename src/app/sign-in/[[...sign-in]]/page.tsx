import { SignIn } from '@clerk/nextjs'
import {
  SESSION_EXPIRED_MESSAGE,
  SESSION_EXPIRED_SIGN_IN_REASON,
} from '@/lib/session-config'

type SignInPageProps = {
  searchParams: Promise<{ reason?: string }>
}

export default async function SignInPage(props: SignInPageProps) {
  const searchParams = await props.searchParams;
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 text-sm text-muted-foreground">
        .env.local에 Clerk 키를 설정해 주세요.
      </div>
    )
  }

  const sessionExpired =
    searchParams.reason === SESSION_EXPIRED_SIGN_IN_REASON

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 py-12">
      {sessionExpired && (
        <p
          className="max-w-sm rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100"
          role="status"
        >
          {SESSION_EXPIRED_MESSAGE}
        </p>
      )}
      <SignIn />
    </div>
  )
}
