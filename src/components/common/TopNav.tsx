import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { AlphaBadge } from '@/components/common/AlphaBadge'
import { TopNavAuth } from '@/components/common/TopNavAuth'
import { Separator } from '@/components/ui/separator'
import { SITE_MAX_WIDTH_CLASS } from '@/lib/layout'
import { getAppUrl, getInfoUrl } from '@/lib/routes'
import { getIsAlphaPeriod } from '@/lib/fuel-settings'
import { isAdmin } from '@/lib/user-role'
import { cn } from '@/lib/utils'
import { getRequestHost } from '@/lib/request-host'

type TopNavProps = {
  variant: 'www' | 'spark' | 'show'
}

const linkClass =
  'text-sm text-muted-foreground transition-colors hover:text-foreground'

function resolveWwwPath(subpath: string, host: string): string {
  const base = getAppUrl('www', host).replace(/\/$/, '')
  const path = subpath.startsWith('/') ? subpath : `/${subpath}`
  return base ? `${base}${path}` : path
}

export async function TopNav({ variant }: TopNavProps) {
  const host = await getRequestHost()
  const { userId } = await auth()
  const showAdmin = userId ? await isAdmin(userId) : false
  const isAlphaPeriod = await getIsAlphaPeriod()

  const infoHref = getInfoUrl(host)
  const sparkHref = getAppUrl('spark', host)
  const showHref = getAppUrl('show', host)
  const boardHref = resolveWwwPath('/board', host)
  const adminHref = resolveWwwPath('/admin', host)
  const idosquareHref = variant === 'www' ? '/info' : infoHref

  return (
    <header className="sticky top-0 z-50 border-hairline border-b border-border bg-background/80 backdrop-blur-md">
      <nav
        className={cn(
          'mx-auto flex h-12 items-center justify-between px-4 sm:px-6',
          SITE_MAX_WIDTH_CLASS,
        )}
      >
        <div className="flex items-center gap-1.5">
          <Link
            href={idosquareHref}
            className="text-sm font-medium tracking-tight text-foreground"
          >
            Idosquare
          </Link>
          {isAlphaPeriod ? <AlphaBadge /> : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Link href={infoHref} className={linkClass}>
              Info
            </Link>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Link
              href={sparkHref}
              className={cn(
                linkClass,
                variant === 'spark' && 'font-medium text-foreground',
              )}
            >
              Spark
            </Link>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Link
              href={showHref}
              className={cn(
                linkClass,
                variant === 'show' && 'font-medium text-foreground',
              )}
            >
              Show
            </Link>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Link href={boardHref} className={linkClass}>
              Board
            </Link>
            {showAdmin && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Link href={adminHref} className={linkClass}>
                  Admin
                </Link>
              </>
            )}
          </div>
          <Separator orientation="vertical" className="h-4" />
          <TopNavAuth />
        </div>
      </nav>
    </header>
  )
}
