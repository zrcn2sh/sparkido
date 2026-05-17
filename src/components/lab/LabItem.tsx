import { MarkdownBody } from '@/components/markdown/MarkdownBody'
import { Badge } from '@/components/ui/badge'
import { formatKstDateTime } from '@/lib/datetime'
import { formatLabSourceLinkLabel } from '@/lib/lab-links'
import { getSparkStageMeta } from '@/lib/spark-stages'
import type { LabLog } from '@/types'

type LabItemProps = {
  log: LabLog
}

export function LabItem({ log }: LabItemProps) {
  const stage = getSparkStageMeta(log.stage)

  return (
    <li className="relative border-l border-primary/40 pb-8 pl-5 last:pb-0">
      <span className="absolute -left-[5px] top-1 size-2 rounded-full bg-primary" />
      <div className="flex w-full items-center justify-between gap-3">
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-md border-hairline border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium"
          title={stage.shortLabel}
        >
          <span aria-hidden>{stage.icon}</span>
          {stage.label}
        </span>
        <time
          dateTime={log.createdAt}
          className="shrink-0 text-right text-xs tabular-nums text-muted-foreground"
        >
          {formatKstDateTime(log.createdAt)}
        </time>
      </div>
      <MarkdownBody content={log.content} className="mt-2" />
      {log.techStack && log.techStack.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {log.techStack.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {log.sourceUrl && (
        <p className="mt-3 text-sm">
          <a
            href={log.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            {formatLabSourceLinkLabel(log.sourceUrl)}
          </a>
        </p>
      )}
      {log.codeSnippet && (
        <pre className="mt-3 overflow-x-auto rounded-lg border-hairline border border-border bg-muted/50 p-3 font-mono text-xs">
          <code>{log.codeSnippet}</code>
        </pre>
      )}
    </li>
  )
}
