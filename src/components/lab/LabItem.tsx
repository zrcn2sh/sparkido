import type { LabLog } from '@/types'

type LabItemProps = {
  log: LabLog
}

export function LabItem({ log }: LabItemProps) {
  return (
    <li className="relative border-l border-primary/40 pb-8 pl-5 last:pb-0">
      <span className="absolute -left-[5px] top-1 size-2 rounded-full bg-primary" />
      <span className="text-xs font-medium text-primary">{log.type}</span>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
        {log.content}
      </p>
      {log.codeSnippet && (
        <pre className="mt-3 overflow-x-auto rounded-lg border-hairline border border-border bg-muted/50 p-3 font-mono text-xs">
          <code>{log.codeSnippet}</code>
        </pre>
      )}
      <time className="mt-2 block text-xs text-muted-foreground">
        {new Date(log.createdAt).toLocaleString('ko-KR')}
      </time>
    </li>
  )
}
