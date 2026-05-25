import { cn } from '@/lib/utils'

type IdoWebShellProps = {
  children: React.ReactNode
  /** help 허브는 중앙 카드, link·문서는 상단 정렬 */
  variant?: 'center' | 'top'
  className?: string
}

export function IdoWebShell({
  children,
  variant = 'top',
  className,
}: IdoWebShellProps) {
  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-50',
        variant === 'center' && 'items-center justify-center px-4 py-8',
        variant === 'top' && 'items-center px-5 py-8 pb-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
