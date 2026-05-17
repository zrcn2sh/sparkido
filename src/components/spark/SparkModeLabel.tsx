import { User, Users } from 'lucide-react'
import { SPARK_MODE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { SparkMode } from '@/types'

const SPARK_MODE_ICONS = {
  solo: User,
  open: Users,
} as const

type SparkModeLabelProps = {
  mode: SparkMode
  className?: string
  iconClassName?: string
}

export function SparkModeLabel({
  mode,
  className,
  iconClassName,
}: SparkModeLabelProps) {
  const Icon = SPARK_MODE_ICONS[mode]
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Icon
        className={cn('size-3.5 shrink-0 text-primary', iconClassName)}
        aria-hidden
      />
      {SPARK_MODE_LABELS[mode]}
    </span>
  )
}
