'use client'

import { Lightbulb } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { SparkFormFieldGuide } from '@/lib/spark-form'

type SparkFormFieldProps = {
  id: string
  label: string
  guide?: SparkFormFieldGuide
  required?: boolean
  maxLength?: number
  valueLength?: number
  children: React.ReactNode
  className?: string
}

function formatExample(example: string) {
  return example.replace(/^예\)\s*/, '').trim()
}

export function SparkFormField({
  id,
  label,
  guide,
  required,
  maxLength,
  valueLength = 0,
  children,
  className,
}: SparkFormFieldProps) {
  const hasGuide = !!guide?.description?.trim()

  return (
    <fieldset className={cn('space-y-2.5 border-0 p-0', className)}>
      <legend className="sr-only">{label}</legend>

      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="min-w-0 text-base font-medium">
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden>
              {' '}
              *
            </span>
          ) : null}
        </Label>
        {maxLength != null && (
          <span
            className={cn(
              'shrink-0 text-xs tabular-nums text-muted-foreground',
              valueLength > maxLength && 'text-destructive',
            )}
            aria-live="polite"
          >
            {valueLength}/{maxLength}
          </span>
        )}
      </div>

      {hasGuide && (
        <aside
          className="rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/35"
          aria-label={`${label} 작성 가이드`}
        >
          <div className="flex gap-2 text-xs leading-snug">
            <span className="flex shrink-0 items-center gap-1 font-semibold text-amber-900 dark:text-amber-200/90">
              <Lightbulb
                className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              작성 가이드
            </span>
            <p className="min-w-0 text-amber-950/75 dark:text-amber-100/80">
              {guide!.description}
            </p>
          </div>
          {guide?.example?.trim() ? (
            <p className="mt-1.5 border-t border-amber-200/70 pt-1.5 text-xs leading-snug text-amber-950/90 dark:border-amber-800/50 dark:text-amber-50/90">
              <span className="font-semibold text-amber-800 dark:text-amber-300">
                예시
              </span>
              <span className="text-amber-950/70 dark:text-amber-100/70">
                {' '}
                —{' '}
              </span>
              {formatExample(guide.example)}
            </p>
          ) : null}
        </aside>
      )}

      <div
        className={cn(
          'rounded-lg border border-slate-200 bg-white p-3 shadow-sm',
          'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40',
          'dark:border-slate-700 dark:bg-slate-950',
          '[&_[data-slot=input]]:border-0 [&_[data-slot=input]]:bg-transparent',
          '[&_[data-slot=input]]:px-0 [&_[data-slot=input]]:shadow-none',
          '[&_[data-slot=input]]:focus-visible:ring-0',
          '[&_[data-slot=textarea]]:border-0 [&_[data-slot=textarea]]:bg-transparent',
          '[&_[data-slot=textarea]]:px-0 [&_[data-slot=textarea]]:shadow-none',
          '[&_[data-slot=textarea]]:focus-visible:ring-0',
        )}
      >
        {children}
      </div>
    </fieldset>
  )
}
