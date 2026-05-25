import Link from 'next/link'
import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { getHelpUrl, getLinkUrl } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { getRequestHost } from '@/lib/request-host'

const currentYear = new Date().getFullYear()

export async function InfoFooter() {
  const host = await getRequestHost()
  const linkHref = getLinkUrl(host)
  const helpHref = getHelpUrl(host)

  return (
    <footer
      className={cn(
        'mt-16 border-t border-border bg-muted/30 py-8',
        SITE_MAX_WIDTH_CLASS,
        SITE_HORIZONTAL_PADDING_CLASS,
        'mx-auto w-full',
      )}
    >
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} IdoSquare. All rights reserved.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
          <Link
            href={linkHref}
            className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Apps
          </Link>
          <Link
            href={helpHref}
            className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Help
          </Link>
          <Link
            href="/privacy"
            className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  )
}
