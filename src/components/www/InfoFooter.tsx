import Link from 'next/link'
import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { cn } from '@/lib/utils'

const currentYear = new Date().getFullYear()

export function InfoFooter() {
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
        <Link
          href="/privacy"
          className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Privacy
        </Link>
      </div>
    </footer>
  )
}
