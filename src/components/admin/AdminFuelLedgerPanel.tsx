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
import { fuelLedgerKindLabel } from '@/lib/fuel-ledger-labels'
import { cn } from '@/lib/utils'
import type { AdminMemberListItem } from '@/types'

type LedgerEntry = {
  id: string
  clerkUserId: string
  kind: string
  deltaAvailable: number
  deltaTotal: number
  availableAfter: number
  totalAfter: number
  refType: string | null
  refId: string | null
  relatedLedgerId: string | null
  createdAt: string
  nickname: string | null
}

type LedgerResponse = {
  entries: LedgerEntry[]
  totalCount: number
  balance: { available: number; total: number } | null
  error?: string
}

type AdminFuelLedgerPanelProps = {
  members: AdminMemberListItem[]
  defaultDateFrom: string
  defaultDateTo: string
}

function formatDelta(n: number): string {
  if (n > 0) return `+${n}`
  return String(n)
}

export function AdminFuelLedgerPanel({
  members,
  defaultDateFrom,
  defaultDateTo,
}: AdminFuelLedgerPanelProps) {
  const [clerkUserId, setClerkUserId] = useState('')
  const [dateFrom, setDateFrom] = useState(defaultDateFrom)
  const [dateTo, setDateTo] = useState(defaultDateTo)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<LedgerResponse | null>(null)
  const [offset, setOffset] = useState(0)
  const limit = 50

  const load = useCallback(
    async (nextOffset = 0) => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (clerkUserId) params.set('clerkUserId', clerkUserId)
        if (dateFrom) params.set('dateFrom', dateFrom)
        if (dateTo) params.set('dateTo', dateTo)
        params.set('limit', String(limit))
        params.set('offset', String(nextOffset))

        const res = await fetch(`/api/admin/fuel/ledger?${params}`)
        const json = (await res.json()) as LedgerResponse
        if (!res.ok) {
          setError(json.error ?? 'Fuel 이력을 불러오지 못했습니다.')
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
    [clerkUserId, dateFrom, dateTo],
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
              <Label htmlFor="fuel-ledger-user">사용자</Label>
              <select
                id="fuel-ledger-user"
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
              <Label htmlFor="fuel-ledger-from">기간 시작 (KST)</Label>
              <Input
                id="fuel-ledger-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className={ADMIN_FIELD_CLASS}>
              <Label htmlFor="fuel-ledger-to">기간 종료 (KST)</Label>
              <Input
                id="fuel-ledger-to"
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
        <>
          {data.balance && (
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminPanel>
                <p className="text-xs text-muted-foreground">현재 사용 가능 Fuel</p>
                <p className="mt-1 font-mono text-2xl font-medium tabular-nums">
                  ⚡ {data.balance.available}
                </p>
              </AdminPanel>
              <AdminPanel>
                <p className="text-xs text-muted-foreground">누적 Fuel (적립 합계)</p>
                <p className="mt-1 font-mono text-2xl font-medium tabular-nums">
                  ⚡ {data.balance.total}
                </p>
              </AdminPanel>
            </div>
          )}

          {!data.balance && clerkUserId === '' && (
            <p className="text-sm text-muted-foreground">
              사용자를 선택하면 현재·누적 Fuel 잔액을 표시합니다.
            </p>
          )}

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
                조건에 맞는 Fuel 이력이 없습니다.
              </p>
            ) : (
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">일시 (KST)</th>
                    <th className="px-3 py-2 font-medium">사용자</th>
                    <th className="px-3 py-2 font-medium">구분</th>
                    <th className="px-3 py-2 font-medium text-right">
                      사용 가능 변동
                    </th>
                    <th className="px-3 py-2 font-medium text-right">
                      누적 변동
                    </th>
                    <th className="px-3 py-2 font-medium text-right">
                      사용 가능 (후)
                    </th>
                    <th className="px-3 py-2 font-medium text-right">
                      누적 (후)
                    </th>
                    <th className="px-3 py-2 font-medium">참조</th>
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
                        <span className="font-medium">
                          {row.nickname ?? '—'}
                        </span>
                        <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                          {row.clerkUserId.slice(0, 12)}…
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {fuelLedgerKindLabel(row.kind)}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-2 text-right font-mono tabular-nums',
                          row.deltaAvailable > 0 && 'text-primary',
                          row.deltaAvailable < 0 && 'text-destructive',
                        )}
                      >
                        {formatDelta(row.deltaAvailable)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {formatDelta(row.deltaTotal)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {row.availableAfter}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {row.totalAfter}
                      </td>
                      <td className="max-w-[10rem] truncate px-3 py-2 font-mono text-xs text-muted-foreground">
                        {row.refType && row.refId
                          ? `${row.refType}:${row.refId.slice(0, 8)}…`
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
        </>
      )}
    </div>
  )
}
