import { BoardNav } from '@/components/board/BoardNav'

type BoardShellProps = {
  children: React.ReactNode
}

export function BoardShell({ children }: BoardShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl gap-8 px-4 py-10 sm:px-6">
      <aside className="hidden w-44 shrink-0 lg:block">
        <div className="sticky top-16">
          <BoardNav />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 lg:hidden">
          <BoardNav />
        </div>
        {children}
      </div>
    </div>
  )
}
