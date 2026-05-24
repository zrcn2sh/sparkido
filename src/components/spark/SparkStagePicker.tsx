'use client'

import { SPARK_STAGES } from '@/lib/spark-stages'
import { cn } from '@/lib/utils'
import type { SparkStage } from '@/types'

type SparkStagePickerProps = {
  value: SparkStage
  onChange: (stage: SparkStage) => void
  name?: string
  disabled?: boolean
}

export function SparkStagePicker({
  value,
  onChange,
  name = 'stage',
  disabled,
}: SparkStagePickerProps) {
  return (
    <fieldset className="w-full min-w-0 space-y-2 border-0 p-0" disabled={disabled}>
      <legend className="text-sm font-medium leading-none">단계 *</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SPARK_STAGES.map((stage) => {
          const selected = value === stage.id
          return (
            <label
              key={stage.id}
              className={cn(
                'flex cursor-pointer flex-col gap-1 rounded-lg border px-3 py-2.5 transition-colors',
                selected
                  ? cn(stage.routeRing, 'ring-1 ring-primary/20')
                  : 'border-border bg-card hover:border-primary/30',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                name={name}
                value={stage.id}
                checked={selected}
                onChange={() => onChange(stage.id)}
                className="sr-only"
              />
              <span className="inline-flex items-center gap-2">
                <span className="text-xl leading-none" aria-hidden>
                  {stage.icon}
                </span>
                <span className="text-sm font-semibold leading-none">
                  {stage.label}
                  <span className="font-normal text-muted-foreground">
                    {' '}
                    · {stage.shortLabel}
                  </span>
                </span>
              </span>
              <span className="text-xs leading-tight text-muted-foreground">
                예) {stage.labExample}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
