import { formatKstDate, parseStoredDate } from '@/lib/datetime'
import { getSparkStageMeta } from '@/lib/spark-stages'
import { cn } from '@/lib/utils'
import type { LabLog, SparkMode } from '@/types'

type RouteNode = {
  id: string
  icon: string
  label: string
  sublabel?: string
  ringClass: string
  faded?: boolean
}

type IdeaRouteBarProps = {
  sparkRouteLabel: string
  sparkMode: SparkMode
  logs: LabLog[]
  variant: 'sidebar' | 'mobile'
  className?: string
}

function buildRouteNodes(sparkRouteLabel: string, logs: LabLog[]): RouteNode[] {
  const sorted = [...logs].sort(
    (a, b) =>
      parseStoredDate(a.createdAt).getTime() -
      parseStoredDate(b.createdAt).getTime(),
  )

  const ideaMeta = getSparkStageMeta('idea')

  const nodes: RouteNode[] = [
    {
      id: 'spark',
      icon: ideaMeta.icon,
      label: 'Spark',
      sublabel: sparkRouteLabel,
      ringClass: ideaMeta.routeRing,
    },
  ]

  for (const log of sorted) {
    const meta = getSparkStageMeta(log.stage)
    nodes.push({
      id: log.id,
      icon: meta.icon,
      label: meta.label,
      sublabel: formatKstDate(log.createdAt),
      ringClass: meta.routeRing,
    })
  }

  return nodes
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
  if (variant === 'mobile') {
    return (
      <li
        className={cn(
          'flex shrink-0 flex-col items-center gap-1.5 px-1',
          node.faded && 'opacity-50',
        )}
      >
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-full border text-base',
            node.ringClass,
          )}
          aria-hidden
        >
          {node.icon}
        </span>
        <span className="max-w-[5rem] truncate text-center text-[10px] font-medium">
          {node.label}
        </span>
      </li>
    )
  }

  return (
    <li className={cn('relative flex gap-3 pb-6', node.faded && 'opacity-60')}>
      {!isLast && (
        <span
          className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border"
          aria-hidden
        />
      )}
      <span
        className={cn(
          'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-sm',
          node.ringClass,
        )}
        aria-hidden
      >
        {node.icon}
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
  sparkRouteLabel,
  sparkMode,
  logs,
  variant,
  className,
}: IdeaRouteBarProps) {
  const nodes = buildRouteNodes(sparkRouteLabel, logs)

  if (variant === 'mobile') {
    return (
      <nav
        aria-label="실행 궤적"
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
      aria-label="실행 궤적"
      className={cn(
        'rounded-lg border-hairline border border-border bg-card p-4 shadow-linear',
        className,
      )}
    >
      <p className="text-sm font-medium">Idea Route</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {sparkMode === 'solo' ? '단일 궤적' : 'Open Do · 분기는 Phase 2'}
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
