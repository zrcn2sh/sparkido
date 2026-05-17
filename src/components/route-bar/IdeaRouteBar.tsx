import { SPARK_STAGE_LABELS } from '@/lib/stage-badge'
import { cn } from '@/lib/utils'
import type { LabLog, Spark } from '@/types'

type RouteNodeState = 'spark' | 'done' | 'bulb' | 'upcoming'

type RouteNode = {
  id: string
  label: string
  sublabel?: string
  state: RouteNodeState
}

type IdeaRouteBarProps = {
  spark: Spark
  logs: LabLog[]
  variant: 'sidebar' | 'mobile'
  className?: string
}

function buildRouteNodes(spark: Spark, logs: LabLog[]): RouteNode[] {
  const sorted = [...logs].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const nodes: RouteNode[] = [
    {
      id: 'spark',
      label: 'Spark',
      sublabel: spark.title,
      state: sorted.length === 0 ? 'spark' : 'done',
    },
  ]

  for (const log of sorted) {
    nodes.push({
      id: log.id,
      label: log.type,
      sublabel: new Date(log.createdAt).toLocaleDateString('ko-KR'),
      state: 'done',
    })
  }

  const last = nodes[nodes.length - 1]
  if (spark.stage === 'launched') {
    nodes.push({
      id: 'launched',
      label: '출시',
      sublabel: SPARK_STAGE_LABELS.launched,
      state: 'bulb',
    })
  } else if (last) {
    last.state = 'spark'
    nodes.push({
      id: 'upcoming',
      label: '다음 단계',
      sublabel: SPARK_STAGE_LABELS[spark.stage],
      state: 'upcoming',
    })
  }

  return nodes
}

const stateStyles: Record<
  RouteNodeState,
  { ring: string; dot: string; icon: string }
> = {
  spark: {
    ring: 'border-blue-400 bg-blue-50',
    dot: 'bg-blue-400',
    icon: '⚡',
  },
  done: {
    ring: 'border-teal-400 bg-teal-50',
    dot: 'bg-teal-400',
    icon: '✓',
  },
  bulb: {
    ring: 'border-teal-400 bg-teal-50',
    dot: 'bg-teal-400',
    icon: '💡',
  },
  upcoming: {
    ring: 'border-dashed border-muted-foreground/40 bg-transparent',
    dot: 'bg-muted-foreground/30',
    icon: '○',
  },
}

function RouteNodeItem({
  node,
  isLast,
  variant,
}: {
  node: RouteNode
  isLast: boolean
  variant: 'sidebar' | 'mobile'
}) {
  const styles = stateStyles[node.state]
  const faded = node.state === 'upcoming'

  if (variant === 'mobile') {
    return (
      <li
        className={cn(
          'flex shrink-0 flex-col items-center gap-1.5 px-1',
          faded && 'opacity-50',
        )}
      >
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-full border text-xs',
            styles.ring,
          )}
          aria-hidden
        >
          {styles.icon}
        </span>
        <span className="max-w-[4.5rem] truncate text-center text-[10px] font-medium">
          {node.label}
        </span>
      </li>
    )
  }

  return (
    <li className={cn('relative flex gap-3 pb-6', faded && 'opacity-60')}>
      {!isLast && (
        <span
          className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border"
          aria-hidden
        />
      )}
      <span
        className={cn(
          'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs',
          styles.ring,
        )}
        aria-hidden
      >
        {styles.icon}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs font-medium text-foreground">{node.label}</p>
        {node.sublabel && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {node.sublabel}
          </p>
        )}
      </div>
    </li>
  )
}

export function IdeaRouteBar({
  spark,
  logs,
  variant,
  className,
}: IdeaRouteBarProps) {
  const nodes = buildRouteNodes(spark, logs)

  if (variant === 'mobile') {
    return (
      <nav
        aria-label="진행 노선"
        className={cn(
          'rounded-lg border-hairline border border-border bg-card p-3 shadow-linear',
          className,
        )}
      >
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Idea Route
        </p>
        <ol className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nodes.map((node, i) => (
            <RouteNodeItem
              key={node.id}
              node={node}
              isLast={i === nodes.length - 1}
              variant="mobile"
            />
          ))}
        </ol>
      </nav>
    )
  }

  return (
    <nav
      aria-label="진행 노선"
      className={cn(
        'rounded-lg border-hairline border border-border bg-card p-4 shadow-linear',
        className,
      )}
    >
      <p className="text-sm font-medium">Idea Route</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {spark.mode === 'solo' ? '단일 궤적' : 'Open Do · 분기는 Phase 2'}
      </p>
      <ol className="mt-4">
        {nodes.map((node, i) => (
          <RouteNodeItem
            key={node.id}
            node={node}
            isLast={i === nodes.length - 1}
            variant="sidebar"
          />
        ))}
      </ol>
    </nav>
  )
}
