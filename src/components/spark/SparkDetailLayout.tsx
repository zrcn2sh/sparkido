import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { cn } from '@/lib/utils'
import { FuelBoost } from '@/components/fuel/FuelBoost'
import { IdeaRouteBar } from '@/components/route-bar/IdeaRouteBar'
import type { LabLog, Spark } from '@/types'

type SparkDetailLayoutProps = {
  spark: Spark
  sparkRouteLabel: string
  logs: LabLog[]
  children: React.ReactNode
}

/** Spark 상세 — 데스크톱 20:60:20, 모바일 상단 Route Bar + 하단 Fuel 접이식 */
export function SparkDetailLayout({
  spark,
  sparkRouteLabel,
  logs,
  children,
}: SparkDetailLayoutProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full py-8 lg:py-10',
        SITE_MAX_WIDTH_CLASS,
        SITE_HORIZONTAL_PADDING_CLASS,
      )}
    >
      <IdeaRouteBar
        variant="mobile"
        sparkRouteLabel={sparkRouteLabel}
        sparkMode={spark.mode}
        logs={logs}
        className="mb-6 lg:hidden"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 lg:gap-6">
        <aside className="hidden lg:col-span-2 lg:block">
          <div className="sticky top-16">
            <IdeaRouteBar
              variant="sidebar"
              sparkRouteLabel={sparkRouteLabel}
              sparkMode={spark.mode}
              logs={logs}
            />
          </div>
        </aside>

        <main className="min-w-0 lg:col-span-6">{children}</main>

        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-16">
            <FuelBoost
              sparkId={spark.id}
              voltage={spark.voltage}
              variant="sidebar"
              className="hidden lg:block"
            />
            <FuelBoost
              sparkId={spark.id}
              voltage={spark.voltage}
              variant="mobile"
              className="lg:hidden"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
