'use client'

import { useCallback, useState } from 'react'
import {
  ADMIN_FIELD_CLASS,
  AdminFieldGroup,
  AdminPanel,
} from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatKstDateTime } from '@/lib/datetime'
import {
  showTileEventActionLabel,
  showTileEventActorLabel,
} from '@/lib/show-tile-event-labels'
import { formatEventPlacementMeta } from '@/lib/show-selection'
import type { ShowTileEventAction } from '@/lib/show-tile-events'
import type { AdminMemberListItem } from '@/types'

type EventEntry = {
  id: string
  action: ShowTileEventAction
  actorType: string
  actorUserId: string | null
  ownerId: string | null
  primaryTileId: string | null
  tileCount: number
  title: string | null
  fuelDaily: number | null
  fuelPeriodCharged: number | null
  refundAmount: number | null
  meta: Record<string, unknown> | null
  createdAt: string
  ownerNickname: string | null
  actorNickname: string | null
}

type EventsResponse = {
  entries: EventEntry[]
  totalCount: number
  error?: string
}

type AdminShowTileEventsPanelProps = {
  members: AdminMemberListItem[]
  defaultDateFrom: string
  defaultDateTo: string
}

export function AdminShowTileEventsPanel({
  members,
  defaultDateFrom,
  defaultDateTo,
}: AdminShowTileEventsPanelProps) {
  const [clerkUserId, setClerkUserId] = useState('')
  const [action, setAction] = useState('')
  const [dateFrom, setDateFrom] = useState(defaultDateFrom)
  const [dateTo, setDateTo] = useState(defaultDateTo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<EventsResponse | null>(null)
  const [offset, setOffset] = useState(0)
  const limit = 50

  const load = useCallback(
    async (nextOffset = 0) => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (clerkUserId) params.set('clerkUserId', clerkUserId)
        if (action) params.set('action', action)
        if (dateFrom) params.set('dateFrom', dateFrom)
        if (dateTo) params.set('dateTo', dateTo)
        params.set('limit', String(limit))
        params.set('offset', String(nextOffset))

        const res = await fetch(`/api/admin/show/events?${params}`)
        const json = (await res.json()) as EventsResponse
        if (!res.ok) {
          setError(json.error ?? 'Show 이력을 불러오지 못했습니다.')
          setData(null)
          return
        }
        setData(json)
        setOffset(nextOffset)
      } catch {
        setError('네트워크 오류가 발생했습니다.')
        setData(null)
      } finally {
        setLoading(false)
      }
    },
    [clerkUserId, action, dateFrom, dateTo],
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    void load(0)
  }

  const totalPages = data ? Math.ceil(data.totalCount / limit) : 0
  const page = Math.floor(offset / limit) + 1

  return (
    <div className="space-y-6">
      <AdminPanel>
        <form onSubmit={handleSearch} className="space-y-4">
          <AdminFieldGroup title="검색 조건">
            <div className={ADMIN_FIELD_CLASS}>
              <Label htmlFor="show-events-owner">등록자(소유자)</Label>
              <select
                id="show-events-owner"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm shadow-sm"
                value={clerkUserId}
                onChange={(e) => setClerkUserId(e.target.value)}
              >
                <option value="">전체 회원</option>
                {members.map((m) => (
                  <option key={m.clerkUserId} value={m.clerkUserId}>
                    {m.nickname}
                    {m.email ? ` (${m.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className={ADMIN_FIELD_CLASS}>
              <Label htmlFor="show-events-action">구분</Label>
              <select
                id="show-events-action"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm shadow-sm"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="">전체</option>
                <option value="register">등록</option>
                <option value="cancel">게시 취소</option>
                <option value="purge_all">전체 삭제</option>
              </select>
            </div>
            <div className={ADMIN_FIELD_CLASS}>
              <Label htmlFor="show-events-from">기간 시작 (KST)</Label>
              <Input
                id="show-events-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className={ADMIN_FIELD_CLASS}>
              <Label htmlFor="show-events-to">기간 종료 (KST)</Label>
              <Input
                id="show-events-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </AdminFieldGroup>
          <Button type="submit" disabled={loading}>
            {loading ? '조회 중…' : '조회'}
          </Button>
        </form>
      </AdminPanel>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {data && (
        <AdminPanel flush className="overflow-x-auto">
          <p className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
            총 {data.totalCount}건
            {data.totalCount > 0 && (
              <span>
                {' '}
                · {page}/{totalPages || 1}페이지
              </span>
            )}
          </p>
          {data.entries.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              조건에 맞는 Show 이력이 없습니다.
            </p>
          ) : (
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">일시 (KST)</th>
                  <th className="px-3 py-2 font-medium">구분</th>
                  <th className="px-3 py-2 font-medium">실행</th>
                  <th className="px-3 py-2 font-medium">등록자</th>
                  <th className="px-3 py-2 font-medium">서비스명</th>
                  <th className="px-3 py-2 font-medium">배치</th>
                  <th className="px-3 py-2 font-medium text-right">타일 수</th>
                  <th className="px-3 py-2 font-medium text-right">Fuel</th>
                  <th className="px-3 py-2 font-medium text-right">환불</th>
                  <th className="px-3 py-2 font-medium">타일 ID</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {formatKstDateTime(row.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      {showTileEventActionLabel(row.action)}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {showTileEventActorLabel(
                        row.actorType as 'user' | 'admin' | 'cron',
                      )}
                      {row.actorNickname &&
                      row.actorUserId !== row.ownerId ? (
                        <span className="mt-0.5 block text-foreground">
                          {row.actorNickname}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium">
                        {row.ownerNickname ?? '—'}
                      </span>
                      {row.ownerId ? (
                        <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                          {row.ownerId.slice(0, 12)}…
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-[8rem] truncate px-3 py-2">
                      {row.title ?? '—'}
                    </td>
                    <td
                      className="max-w-[14rem] px-3 py-2 font-mono text-xs text-muted-foreground"
                      title={formatEventPlacementMeta(row.meta)}
                    >
                      <span className="line-clamp-2 break-all">
                        {formatEventPlacementMeta(row.meta)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {row.tileCount}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                      {row.action === 'register' &&
                      row.fuelPeriodCharged != null ? (
                        <>
                          일 {row.fuelDaily ?? 0} · 당월{' '}
                          {row.fuelPeriodCharged}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      {row.refundAmount != null && row.refundAmount > 0
                        ? `⚡ ${row.refundAmount}`
                        : row.action === 'cancel'
                          ? '0'
                          : '—'}
                    </td>
                    <td className="max-w-[8rem] truncate px-3 py-2 font-mono text-xs text-muted-foreground">
                      {row.primaryTileId
                        ? `${row.primaryTileId.slice(0, 8)}…`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {data.totalCount > limit && (
            <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || offset <= 0}
                onClick={() => void load(Math.max(0, offset - limit))}
              >
                이전
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || offset + limit >= data.totalCount}
                onClick={() => void load(offset + limit)}
              >
                다음
              </Button>
            </div>
          )}
        </AdminPanel>
      )}
    </div>
  )
}
