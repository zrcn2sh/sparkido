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

/** 순서 없음 — Lab 등록 시 이번 작업의 단계 */
export function SparkStagePicker({
  value,
  onChange,
  name = 'stage',
  disabled,
}: SparkStagePickerProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium leading-none">
        작업 단계 *
      </legend>
      <p className="text-xs text-muted-foreground">
        이번 Lab에서 한 일에 가장 가까운 단계를 고르세요. 순서는 정해져 있지
        않습니다.
      </p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {SPARK_STAGES.map((stage) => {
          const selected = value === stage.id
          return (
            <label
              key={stage.id}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 rounded-md border-hairline border px-2 py-1.5 transition-colors',
                selected
                  ? stage.routeRing
                  : 'border-border hover:border-primary/30',
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
              <span className="shrink-0 text-base leading-none" aria-hidden>
                {stage.icon}
              </span>
              <span className="min-w-0 text-left text-[11px] leading-tight">
                <span className="font-medium">{stage.label}</span>
                <span className="text-muted-foreground">
                  {' '}
                  / {stage.shortLabel}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
