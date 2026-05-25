'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BOARD_CATEGORIES } from '@/lib/board-categories'
import { resolveBoardPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { BoardCategory } from '@/types'

function activeCategory(pathname: string, host: string): BoardCategory | null {
  for (const { id } of BOARD_CATEGORIES) {
    const base = resolveBoardPath(`/${id}`, host)
    if (pathname === base || pathname.startsWith(`${base}/`)) {
      return id
    }
    const legacy = `/board/${id}`
    if (pathname === legacy || pathname.startsWith(`${legacy}/`)) {
      return id
    }
  }
  return null
}

type BoardNavProps = {
  host: string
}

export function BoardNav({ host }: BoardNavProps) {
  const pathname = usePathname()
  const current = activeCategory(pathname, host)

  return (
    <nav
      aria-label="게시판 메뉴"
      className="rounded-lg border-hairline border border-border bg-card p-2 shadow-linear"
    >
      <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        게시판
      </p>
      <ul className="space-y-0.5">
        {BOARD_CATEGORIES.map((item) => {
          const isActive = current === item.id
          return (
            <li key={item.id}>
              <Link
                href={resolveBoardPath(`/${item.id}`, host)}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
