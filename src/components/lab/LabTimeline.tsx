import { LabItem } from '@/components/lab/LabItem'
import { Separator } from '@/components/ui/separator'
import type { LabLog } from '@/types'

type LabTimelineProps = {
  logs: LabLog[]
  /** Spark 본문이 비공개로 숨겨진 경우 안내 */
  sparkBodyHidden?: boolean
  sparkAuthorId?: string
  doerNames?: Record<string, string>
  /** 참여자 필터 적용 중일 때 표시 이름 */
  filterDoerId?: string | null
}

export function LabTimeline({
  logs,
  sparkBodyHidden,
  sparkAuthorId,
  doerNames,
  filterDoerId,
}: LabTimelineProps) {
  const filterLabel =
    filterDoerId && doerNames?.[filterDoerId]
      ? doerNames[filterDoerId]
      : null

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-medium">Lab History</h2>
        {filterLabel && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{filterLabel}</span>
            님의 기록만 표시 중
          </p>
        )}
      </div>
      {sparkBodyHidden && (
        <p className="mt-1 text-xs text-muted-foreground">
          Spark 본문은 비공개이지만, 작성자·다른 참여자가 남긴 Lab 기록은 그대로
          볼 수 있습니다.
        </p>
      )}
      <Separator className="my-4" />
      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {filterLabel
            ? `${filterLabel}님이 남긴 Lab 기록이 없습니다.`
            : '아직 Lab 기록이 없습니다. 첫 실행 기록을 남겨 보세요.'}
        </p>
      ) : (
        <ol className="mt-2">
          {logs.map((log) => (
            <LabItem
              key={log.id}
              log={log}
              sparkAuthorId={sparkAuthorId}
              doerName={doerNames?.[log.doerId]}
            />
          ))}
        </ol>
      )}
    </section>
  )
}
