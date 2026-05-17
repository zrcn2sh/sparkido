import { cn } from '@/lib/utils'

type SparkPageShellProps = {
  children: React.ReactNode
  /** 목록·등록 등 단일 컬럼 페이지 너비 */
  width?: 'md' | 'lg' | 'xl'
  className?: string
}

const widthClass = {
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
} as const

/** Spark 목록·등록 등 중앙 정렬 셸 */
export function SparkPageShell({
  children,
  width = 'lg',
  className,
}: SparkPageShellProps) {
  return (
    <section
      className={cn(
        'mx-auto w-full px-4 py-10 sm:px-6',
        widthClass[width],
        className,
      )}
    >
      {children}
    </section>
  )
}
