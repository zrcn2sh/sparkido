import Link from 'next/link'
import { TopNavAuth } from '@/components/common/TopNavAuth'
import { Separator } from '@/components/ui/separator'
import { getAppUrl, resolveSparkPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { headers } from 'next/headers'

type TopNavProps = {
  variant: 'www' | 'spark'
}

const linkClass =
  'text-sm text-muted-foreground transition-colors hover:text-foreground'
const activeClass = 'text-sm font-medium text-foreground'

export function TopNav({ variant }: TopNavProps) {
  const host = headers().get('host') ?? ''
  const wwwUrl = getAppUrl('www', host)
  const sparkUrl = getAppUrl('spark', host)

  return (
    <header className="sticky top-0 z-50 border-hairline border-b border-border bg-background/80 backdrop-blur-md">
      <nav
        className={cn(
          'mx-auto flex h-12 items-center justify-between px-4 sm:px-6',
          variant === 'spark' ? 'max-w-7xl' : 'max-w-5xl',
        )}
      >
        <Link
          href="/"
          className="text-sm font-medium tracking-tight text-foreground"
        >
          Idosquare
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {variant === 'www' ? (
              <>
                <Link href="/" className={activeClass}>
                  소개
                </Link>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Link href="/board" className={linkClass}>
                  게시판
                </Link>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <a href={sparkUrl} className={linkClass}>
                  Spark
                </a>
              </>
            ) : (
              <>
                <Link href={resolveSparkPath('/', host)} className={activeClass}>
                  Spark 목록
                </Link>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Link href={resolveSparkPath('/new', host)} className={linkClass}>
                  등록
                </Link>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <a href={wwwUrl} className={linkClass}>
                  www
                </a>
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
