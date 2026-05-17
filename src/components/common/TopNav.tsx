import Link from 'next/link'
import { TopNavAuth } from '@/components/common/TopNavAuth'
import { Separator } from '@/components/ui/separator'
import { SITE_MAX_WIDTH_CLASS } from '@/lib/layout'
import { getAppUrl } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { headers } from 'next/headers'

type TopNavProps = {
  variant: 'www' | 'spark'
}

const linkClass =
  'text-sm text-muted-foreground transition-colors hover:text-foreground'

function resolveWwwPath(subpath: string, host: string): string {
  const base = getAppUrl('www', host).replace(/\/$/, '')
  const path = subpath.startsWith('/') ? subpath : `/${subpath}`
  return base ? `${base}${path}` : path
}

export function TopNav({ variant }: TopNavProps) {
  const host = headers().get('host') ?? ''
  const wwwHome = getAppUrl('www', host)
  const infoHref = wwwHome
  const sparkHref = getAppUrl('spark', host)
  const boardHref = resolveWwwPath('/board', host)
  const idosquareHref = variant === 'spark' ? wwwHome : '/'

  return (
    <header className="sticky top-0 z-50 border-hairline border-b border-border bg-background/80 backdrop-blur-md">
      <nav
        className={cn(
          'mx-auto flex h-12 items-center justify-between px-4 sm:px-6',
          SITE_MAX_WIDTH_CLASS,
        )}
      >
        <Link
          href={idosquareHref}
          className="text-sm font-medium tracking-tight text-foreground"
        >
          Idosquare
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Link href={infoHref} className={linkClass}>
              Info
            </Link>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Link href={sparkHref} className={linkClass}>
              Spark
            </Link>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Link href={boardHref} className={linkClass}>
              Board
            </Link>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <TopNavAuth />
        </div>
      </nav>
    </header>
  )
}
