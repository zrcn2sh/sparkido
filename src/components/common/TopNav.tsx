import Link from 'next/link'
import { TopNavAuth } from '@/components/common/TopNavAuth'
import { Separator } from '@/components/ui/separator'
import { getAppUrl } from '@/lib/utils'

type TopNavProps = {
  variant: 'www' | 'spark'
}

const linkClass =
  'text-sm text-muted-foreground transition-colors hover:text-foreground'
const activeClass = 'text-sm font-medium text-foreground'

export function TopNav({ variant }: TopNavProps) {
  const wwwUrl = getAppUrl('www')
  const sparkUrl = getAppUrl('spark')

  return (
    <header className="sticky top-0 z-50 border-hairline border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
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
                <Link href="/" className={activeClass}>
                  Spark 목록
                </Link>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Link href="/new" className={linkClass}>
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
