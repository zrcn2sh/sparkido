import { LabItem } from '@/components/lab/LabItem'
import { Separator } from '@/components/ui/separator'
import type { LabLog } from '@/types'

type LabTimelineProps = {
  logs: LabLog[]
  /** Spark 본문이 비공개로 숨겨진 경우 안내 */
  sparkBodyHidden?: boolean
}

export function LabTimeline({ logs, sparkBodyHidden }: LabTimelineProps) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-medium">Lab History</h2>
      {sparkBodyHidden && (
        <p className="mt-1 text-xs text-muted-foreground">
          Spark 본문은 비공개이지만, 참여자가 남긴 Lab 기록은 계속 볼 수 있습니다.
        </p>
      )}
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
