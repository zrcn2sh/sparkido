import { LabItem } from '@/components/lab/LabItem'
import { Separator } from '@/components/ui/separator'
import type { LabLog } from '@/types'

type LabTimelineProps = {
  logs: LabLog[]
}

export function LabTimeline({ logs }: LabTimelineProps) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-medium">Lab History</h2>
      <Separator className="my-4" />
      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          아직 Lab 기록이 없습니다. 첫 실행 기록을 남겨 보세요.
        </p>
      ) : (
        <ol className="mt-2">
          {logs.map((log) => (
            <LabItem key={log.id} log={log} />
          ))}
        </ol>
      )}
    </section>
  )
}
