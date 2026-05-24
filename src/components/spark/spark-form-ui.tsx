'use client'

import { Lightbulb, Lock } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { SparkFormFieldGuide } from '@/lib/spark-form'

function formatExample(example: string) {
  return example.replace(/^예\)\s*/, '').trim()
}

type SparkFormFieldHeaderProps = {
  htmlFor?: string
  label: string
  required?: boolean
  maxLength?: number
  valueLength?: number
}

export function SparkFormFieldHeader({
  htmlFor,
  label,
  required,
  maxLength,
  valueLength = 0,
}: SparkFormFieldHeaderProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <Label htmlFor={htmlFor} className="min-w-0 text-base font-medium">
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
  )
}

type SparkFormGuideProps = {
  label: string
  guide: SparkFormFieldGuide
  variant?: 'hint' | 'locked'
}

export function SparkFormGuide({
  label,
  guide,
  variant = 'hint',
}: SparkFormGuideProps) {
  const isLocked = variant === 'locked'

  return (
    <aside
      className={cn(
        'rounded-lg border px-3 py-2',
        isLocked
          ? 'border-slate-300/80 bg-slate-100 dark:border-slate-600/50 dark:bg-slate-900/50'
          : 'border-amber-200/80 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/35',
      )}
      aria-label={`${label} 안내`}
    >
      <div className="flex gap-2 text-xs leading-snug">
        <span
          className={cn(
            'flex shrink-0 items-center gap-1 font-semibold',
            isLocked
              ? 'text-slate-700 dark:text-slate-300'
              : 'text-amber-900 dark:text-amber-200/90',
          )}
        >
          {isLocked ? (
            <Lock
              className="size-3.5 shrink-0 text-slate-600 dark:text-slate-400"
              aria-hidden
            />
          ) : (
            <Lightbulb
              className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden
            />
          )}
          {isLocked ? '수정 불가' : '작성 가이드'}
        </span>
        <p
          className={cn(
            'min-w-0',
            isLocked
              ? 'text-slate-700/90 dark:text-slate-200/80'
              : 'text-amber-950/75 dark:text-amber-100/80',
          )}
        >
          {guide.description}
        </p>
      </div>
      {guide.example?.trim() ? (
        <p
          className={cn(
            'mt-1.5 border-t pt-1.5 text-xs leading-snug',
            isLocked
              ? 'border-slate-300/70 text-slate-800/90 dark:border-slate-700 dark:text-slate-100/90'
              : 'border-amber-200/70 text-amber-950/90 dark:border-amber-800/50 dark:text-amber-50/90',
          )}
        >
          <span
            className={cn(
              'font-semibold',
              isLocked
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-amber-800 dark:text-amber-300',
            )}
          >
            예시
          </span>
          <span className="opacity-70"> — </span>
          {formatExample(guide.example)}
        </p>
      ) : null}
    </aside>
  )
}

type SparkFormInputShellProps = {
  children: React.ReactNode
  className?: string
}

/** 편집 가능 입력 영역 (흰 배경) */
export function SparkFormInputShell({
  children,
  className,
}: SparkFormInputShellProps) {
  return (
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
        className,
      )}
    >
      {children}
    </div>
  )
}

type SparkFormReadOnlyShellProps = {
  children: React.ReactNode
  className?: string
}

/** 읽기 전용 내용 영역 (슬레이트 배경) */
export function SparkFormReadOnlyShell({
  children,
  className,
}: SparkFormReadOnlyShellProps) {
  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border border-slate-300/70 bg-slate-100/90 p-3 dark:border-slate-600/60 dark:bg-slate-900/40',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SparkFormReadOnlyItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1 rounded-md border border-slate-200/80 bg-white/60 px-3 py-2.5 dark:border-slate-700/50 dark:bg-slate-950/50">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="whitespace-pre-wrap text-sm text-foreground/90">
        {children}
      </div>
    </div>
  )
}
