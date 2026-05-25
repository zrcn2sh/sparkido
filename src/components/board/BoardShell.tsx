import { BoardNav } from '@/components/board/BoardNav'
import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { cn } from '@/lib/utils'

type BoardShellProps = {
  host: string
  children: React.ReactNode
}

export function BoardShell({ host, children }: BoardShellProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full gap-8 py-10',
        SITE_MAX_WIDTH_CLASS,
        SITE_HORIZONTAL_PADDING_CLASS,
      )}
    >
      <aside className="hidden w-44 shrink-0 lg:block">
        <div className="sticky top-16">
          <BoardNav host={host} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 lg:hidden">
          <BoardNav host={host} />
        </div>
        {children}
      </div>
    </div>
  )
}
