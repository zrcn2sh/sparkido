'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_NAV_ITEMS } from '@/lib/admin-nav'
import { resolveAdminPath } from '@/lib/routes'
import { cn } from '@/lib/utils'

type AdminNavProps = {
  host: string
}

export function AdminNav({ host }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className="flex w-44 shrink-0 flex-col items-start gap-0.5 text-left"
      aria-label="Admin 메뉴"
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const href = resolveAdminPath(item.path, host)
        const active =
          pathname === href ||
          pathname.startsWith(`${href}/`) ||
          pathname === `/admin${item.path}` ||
          pathname.startsWith(`/admin${item.path}/`)

        return (
          <Link
            key={item.path}
            href={href}
            className={cn(
              'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
