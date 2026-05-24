'use client'

import {
  buildSparkParticipants,
  PARTICIPANT_COLORS,
} from '@/lib/spark-participants'
import { cn } from '@/lib/utils'
import type { LabLog, Spark } from '@/types'

export type SparkParticipantsPanelProps = {
  spark: Spark
  logs: LabLog[]
  doerNames: Record<string, string>
  selectedDoerId: string | null
  onSelectDoerId: (doerId: string | null) => void
  variant: 'sidebar' | 'mobile'
  className?: string
}

function ParticipantButton({
  label,
  sublabel,
  color,
  selected,
  onClick,
  compact,
}: {
  label: string
  sublabel: string
  color: string
  selected: boolean
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border text-left transition-colors',
        compact ? 'px-2.5 py-2' : 'px-3 py-2.5',
        selected
          ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
          : 'border-border bg-background hover:bg-muted/50',
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'shrink-0 rounded-full border-2',
            compact ? 'size-7' : 'size-8',
          )}
          style={{ borderColor: color, backgroundColor: `${color}33` }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate font-medium text-foreground',
              compact ? 'text-xs' : 'text-sm',
            )}
          >
            {label}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">{sublabel}</p>
        </div>
      </div>
    </button>
  )
}

export function SparkParticipantsPanel({
  spark,
  logs,
  doerNames,
  selectedDoerId,
  onSelectDoerId,
  variant,
  className,
}: SparkParticipantsPanelProps) {
  const participants = buildSparkParticipants(spark, logs, doerNames)
  const showAll = selectedDoerId === null

  if (variant === 'mobile') {
    return (
      <nav
        aria-label="참여자"
        className={cn(
          'rounded-lg border border-border bg-card p-3 shadow-linear',
          className,
        )}
      >
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          참여자
        </p>
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onSelectDoerId(null)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              showAll
                ? 'border-primary bg-primary/15 text-foreground'
                : 'border-border text-muted-foreground hover:bg-muted/50',
            )}
            aria-pressed={showAll}
          >
            전체
          </button>
          {participants.map((p) => (
            <button
              key={p.userId}
              type="button"
              onClick={() => onSelectDoerId(p.userId)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                selectedDoerId === p.userId
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted/50',
              )}
              aria-pressed={selectedDoerId === p.userId}
            >
              {p.displayName}
              {p.labCount > 0 ? ` (${p.labCount})` : ''}
            </button>
          ))}
        </div>
      </nav>
    )
  }

  return (
    <nav
      aria-label="참여자"
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-linear',
        className,
      )}
    >
      <p className="text-sm font-medium">참여자</p>
      <p className="mt-1 text-xs text-muted-foreground">
        선택한 사람의 Lab 기록만 표시합니다.
      </p>
      <div className="mt-3 space-y-2">
        <ParticipantButton
          label="전체"
          sublabel={`Lab ${logs.length}건`}
          color={PARTICIPANT_COLORS.author}
          selected={showAll}
          onClick={() => onSelectDoerId(null)}
        />
        {participants.map((p) => (
          <ParticipantButton
            key={p.userId}
            label={p.displayName}
            sublabel={
              p.role === 'author'
                ? `작성자 · Lab ${p.labCount}건`
                : `참여 · Lab ${p.labCount}건`
            }
            color={p.color}
            selected={selectedDoerId === p.userId}
            onClick={() => onSelectDoerId(p.userId)}
          />
        ))}
      </div>
      {spark.mode === 'solo' && participants.length === 1 && (
        <p className="mt-3 text-[10px] text-muted-foreground">
          Solo Do — 작성자만 Lab을 남깁니다.
        </p>
      )}
    </nav>
  )
}
