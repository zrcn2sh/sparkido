import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { NicknameProfilePanel } from '@/components/auth/NicknameProfilePanel'
import { Button } from '@/components/ui/button'
import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { resolveSparkPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { getRequestHost } from '@/lib/request-host'

export const dynamic = 'force-dynamic'

export default async function ProfileSettingsPage() {
  const { userId } = await auth()
  const host = await getRequestHost()
  if (!userId) {
    redirect('/sign-in?redirect_url=/settings/profile')
  }

  const homeHref = resolveSparkPath('/', host)

  return (
    <div
      className={cn(
        'mx-auto py-12',
        SITE_MAX_WIDTH_CLASS,
        SITE_HORIZONTAL_PADDING_CLASS,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 h-8 text-muted-foreground"
        render={<Link href={homeHref} />}
      >
        ← 홈
      </Button>
      <h1 className="text-2xl font-bold">별명 관리</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        회원 등급을 확인하고, 서비스에 표시할 별명을 관리합니다.
      </p>
      <div className="mt-8 max-w-md">
        <NicknameProfilePanel mode="page" redirectAfterSave={false} />
      </div>
    </div>
  )
}
