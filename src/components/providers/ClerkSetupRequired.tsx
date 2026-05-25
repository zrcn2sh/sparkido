export function ClerkSetupRequired() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-lg font-medium">인증 설정 필요</h1>
      <p className="text-sm text-muted-foreground">
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        </code>
        가 빌드에 포함되지 않았습니다. Cloudflare Workers Builds의{' '}
        <strong>Build variables</strong>에 Clerk Production Publishable key를
        넣고 <strong>다시 빌드·배포</strong>하세요. (런타임 Secret만으로는
        클라이언트 번들에 반영되지 않습니다.)
      </p>
      <p className="text-xs text-muted-foreground">
        <code className="rounded bg-muted px-1">CLERK_SECRET_KEY</code>는
        Variables and Secrets에 추가하세요.
      </p>
    </div>
  )
}
