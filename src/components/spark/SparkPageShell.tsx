import { SITE_HORIZONTAL_PADDING_CLASS, SITE_MAX_WIDTH_CLASS } from '@/lib/layout'
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
  xl: SITE_MAX_WIDTH_CLASS,
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
        'mx-auto w-full py-10',
        SITE_HORIZONTAL_PADDING_CLASS,
        widthClass[width],
        className,
      )}
    >
      {children}
    </section>
  )
}
