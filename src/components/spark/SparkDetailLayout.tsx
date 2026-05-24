'use client'

import { useMemo, useState } from 'react'
import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { filterLabLogsByDoer } from '@/lib/spark-participants'
import { cn } from '@/lib/utils'
import { SparkCheerPanel } from '@/components/fuel/SparkCheerPanel'
import { LabTimeline } from '@/components/lab/LabTimeline'
import { SparkParticipantsPanel } from '@/components/route-bar/SparkParticipantsPanel'
import type { LabLog, Spark } from '@/types'

type SparkDetailLayoutProps = {
  spark: Spark
  logs: LabLog[]
  doerNames: Record<string, string>
  cheerCount?: number
  maxCheerPerUserPerSparkDay?: number
  isSignedIn?: boolean
  sparkBodyHidden?: boolean
  children: React.ReactNode
  labForm?: React.ReactNode
}

/** Spark 상세 — 데스크톱 20:60:20, 좌측 참여자 · Lab 필터 */
export function SparkDetailLayout({
  spark,
  logs,
  doerNames,
  cheerCount = 0,
  maxCheerPerUserPerSparkDay = 10,
  isSignedIn = false,
  sparkBodyHidden = false,
  children,
  labForm,
}: SparkDetailLayoutProps) {
  const [selectedDoerId, setSelectedDoerId] = useState<string | null>(null)

  const filteredLogs = useMemo(
    () => filterLabLogsByDoer(logs, selectedDoerId),
    [logs, selectedDoerId],
  )

  const panelProps = {
    spark,
    logs,
    doerNames,
    selectedDoerId,
    onSelectDoerId: setSelectedDoerId,
  }

  return (
    <div
      className={cn(
        'mx-auto w-full py-8 lg:py-10',
        SITE_MAX_WIDTH_CLASS,
        SITE_HORIZONTAL_PADDING_CLASS,
      )}
    >
      <SparkParticipantsPanel
        variant="mobile"
        {...panelProps}
        className="mb-6 lg:hidden"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 lg:gap-6">
        <aside className="hidden lg:col-span-2 lg:block">
          <div className="sticky top-16">
            <SparkParticipantsPanel variant="sidebar" {...panelProps} />
          </div>
        </aside>

        <main className="min-w-0 lg:col-span-6">
          {children}
          <LabTimeline
            logs={filteredLogs}
            sparkBodyHidden={sparkBodyHidden}
            sparkAuthorId={spark.authorId}
            doerNames={doerNames}
            filterDoerId={selectedDoerId}
          />
          {labForm}
        </main>

        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-16">
            <SparkCheerPanel
              sparkId={spark.id}
              cheerCount={cheerCount}
              maxCheerPerUserPerSparkDay={maxCheerPerUserPerSparkDay}
              isSignedIn={isSignedIn}
              variant="sidebar"
              className="hidden lg:block"
            />
            <SparkCheerPanel
              sparkId={spark.id}
              cheerCount={cheerCount}
              maxCheerPerUserPerSparkDay={maxCheerPerUserPerSparkDay}
              isSignedIn={isSignedIn}
              variant="mobile"
              className="lg:hidden"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
