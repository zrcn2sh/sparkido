'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ADMIN_FIELD_CLASS,
  AdminFieldGroup,
  AdminPanel,
} from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatKstDateTime } from '@/lib/datetime'
import type { FuelSettingsInput } from '@/lib/fuel-settings'
import { SHOW_GRID_COLS, SHOW_GRID_ROWS } from '@/lib/show-grid'
import { cn } from '@/lib/utils'

type FormState = {
  isAlphaPeriod: boolean
  fuelSparkCreate: string
  fuelLabCreate: string
  fuelOnCheer: string
  fuelLogin: string
  fuelSignup: string
  maxCheerPerUserPerSparkDay: string
  maxCheerPerUserDay: string
  showFuelBase: string
  showFuelPerCol: string
  showFuelPerRow: string
  showTileMaxCols: string
  showTileMaxRows: string
}

type SettingsResponse = {
  settings: FuelSettingsInput & { updatedAt: string; updatedBy: string | null }
  error?: string
}

function toFormState(s: SettingsResponse['settings']): FormState {
  return {
    isAlphaPeriod: s.isAlphaPeriod === true,
    fuelSparkCreate: String(s.fuelSparkCreate),
    fuelLabCreate: String(s.fuelLabCreate),
    fuelOnCheer: String(s.fuelOnCheer),
    fuelLogin: String(s.fuelLogin),
    fuelSignup: String(s.fuelSignup),
    maxCheerPerUserPerSparkDay: String(s.maxCheerPerUserPerSparkDay),
    maxCheerPerUserDay: String(s.maxCheerPerUserDay),
    showFuelBase: String(s.showFuelBase),
    showFuelPerCol: String(s.showFuelPerCol),
    showFuelPerRow: String(s.showFuelPerRow),
    showTileMaxCols: String(s.showTileMaxCols),
    showTileMaxRows: String(s.showTileMaxRows),
  }
}

function toPayload(form: FormState): FuelSettingsInput {
  return {
    isAlphaPeriod: form.isAlphaPeriod,
    fuelSparkCreate: Number(form.fuelSparkCreate),
    fuelLabCreate: Number(form.fuelLabCreate),
    fuelOnCheer: Number(form.fuelOnCheer),
    fuelLogin: Number(form.fuelLogin),
    fuelSignup: Number(form.fuelSignup),
    maxCheerPerUserPerSparkDay: Number(form.maxCheerPerUserPerSparkDay),
    maxCheerPerUserDay: Number(form.maxCheerPerUserDay),
    showFuelBase: Number(form.showFuelBase),
    showFuelPerCol: Number(form.showFuelPerCol),
    showFuelPerRow: Number(form.showFuelPerRow),
    showTileMaxCols: Number(form.showTileMaxCols),
    showTileMaxRows: Number(form.showTileMaxRows),
  }
}

export function AdminFuelSettingsForm() {
  const [form, setForm] = useState<FormState | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/settings/fuel')
      const data = (await res.json()) as SettingsResponse
      if (!res.ok) {
        setError(data.error ?? '설정을 불러오지 못했습니다.')
        return
      }
      setForm(toFormState(data.settings))
      setUpdatedAt(data.settings.updatedAt)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setPending(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings/fuel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: toPayload(form) }),
      })
      const data = (await res.json()) as SettingsResponse
      if (!res.ok) {
        setError(data.error ?? '저장에 실패했습니다.')
        return
      }
      setForm(toFormState(data.settings))
      setUpdatedAt(data.settings.updatedAt)
      setSaved(true)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <AdminPanel>
        <p className="text-sm text-muted-foreground">설정을 불러오는 중…</p>
      </AdminPanel>
    )
  }

  if (!form) {
    return (
      <AdminPanel>
        <p className="text-sm text-destructive" role="alert">
          {error ?? '설정을 불러올 수 없습니다.'}
        </p>
      </AdminPanel>
    )
  }

  return (
    <AdminPanel>
      <form onSubmit={handleSubmit} className="block w-full min-w-0 space-y-8">
        <AdminFieldGroup title="서비스 운영">
          <div className={cn(ADMIN_FIELD_CLASS, 'md:col-span-2 xl:col-span-3')}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-input"
                checked={form.isAlphaPeriod}
                onChange={(e) =>
                  setForm((f) =>
                    f ? { ...f, isAlphaPeriod: e.target.checked } : f,
                  )
                }
              />
              <span>
                <span className="font-medium text-foreground">알파 기간</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  켜면 상단 Idosquare 옆에 α 표시가 나타나고, Spark·Lab·응원
                  Fuel 적립은 그대로이며 Show 타일 등록 시 Fuel만 차감하지
                  않습니다.
                </span>
              </span>
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup title="사용자 Fuel 획득량">
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="fuelSparkCreate">Spark 작성</Label>
            <Input
              id="fuelSparkCreate"
              type="number"
              min={0}
              required
              value={form.fuelSparkCreate}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, fuelSparkCreate: e.target.value } : f,
                )
              }
            />
          </div>
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="fuelLabCreate">Lab 작성</Label>
            <Input
              id="fuelLabCreate"
              type="number"
              min={0}
              required
              value={form.fuelLabCreate}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, fuelLabCreate: e.target.value } : f,
                )
              }
            />
          </div>
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="fuelOnCheer">응원하기 (1회)</Label>
            <Input
              id="fuelOnCheer"
              type="number"
              min={0}
              required
              value={form.fuelOnCheer}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, fuelOnCheer: e.target.value } : f))
              }
            />
          </div>
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="fuelLogin">로그인 (KST 1일 1회)</Label>
            <Input
              id="fuelLogin"
              type="number"
              min={0}
              required
              value={form.fuelLogin}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, fuelLogin: e.target.value } : f))
              }
            />
          </div>
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="fuelSignup">회원가입 (최초 1회)</Label>
            <Input
              id="fuelSignup"
              type="number"
              min={0}
              required
              value={form.fuelSignup}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, fuelSignup: e.target.value } : f))
              }
            />
          </div>
          <div className={cn(ADMIN_FIELD_CLASS, 'md:col-span-2 xl:col-span-3')}>
            <Label htmlFor="maxCheerPerUserPerSparkDay">
              응원하기 Spark당 일 최대횟수
            </Label>
            <Input
              id="maxCheerPerUserPerSparkDay"
              type="number"
              min={0}
              required
              value={form.maxCheerPerUserPerSparkDay}
              onChange={(e) =>
                setForm((f) =>
                  f
                    ? { ...f, maxCheerPerUserPerSparkDay: e.target.value }
                    : f,
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              사용자가 같은 Spark에 하루에 응원할 수 있는 최대 횟수입니다.
            </p>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup title="Show 타일 등록 (사용 Fuel)">
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="showFuelBase">기본 Fuel (1×1·1일)</Label>
            <Input
              id="showFuelBase"
              type="number"
              min={0}
              required
              value={form.showFuelBase}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, showFuelBase: e.target.value } : f,
                )
              }
            />
          </div>
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="showFuelPerCol">가로 1칸 추가 Fuel (1일)</Label>
            <Input
              id="showFuelPerCol"
              type="number"
              min={0}
              required
              value={form.showFuelPerCol}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, showFuelPerCol: e.target.value } : f,
                )
              }
            />
          </div>
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="showFuelPerRow">세로 1칸 추가 Fuel (1일)</Label>
            <Input
              id="showFuelPerRow"
              type="number"
              min={0}
              required
              value={form.showFuelPerRow}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, showFuelPerRow: e.target.value } : f,
                )
              }
            />
          </div>
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="showTileMaxCols">최대 가로 칸 수</Label>
            <Input
              id="showTileMaxCols"
              type="number"
              min={1}
              max={SHOW_GRID_COLS}
              required
              value={form.showTileMaxCols}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, showTileMaxCols: e.target.value } : f,
                )
              }
            />
          </div>
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="showTileMaxRows">최대 세로 칸 수</Label>
            <Input
              id="showTileMaxRows"
              type="number"
              min={1}
              max={SHOW_GRID_ROWS}
              required
              value={form.showTileMaxRows}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, showTileMaxRows: e.target.value } : f,
                )
              }
            />
          </div>
          <p
            className={cn(
              'text-xs text-muted-foreground md:col-span-2 xl:col-span-3',
            )}
          >
            Fuel(1일): 바운딩 박스 기준 기본 + (가로−1)×가로 추가 + (세로−1)×세로
            추가. 등록 시 청구 = 1일 Fuel × 당월 잔여일(KST, 등록일 포함).
            등록 크기: 1×1 ~ 최대 가로×세로(그리드 {SHOW_GRID_COLS}×
            {SHOW_GRID_ROWS} 이하). P1·P2 가로 연결은 하나의 직사각형으로
            계산합니다. 매월 1일 0시(KST) 타일 전체 삭제.
          </p>
        </AdminFieldGroup>

        <AdminFieldGroup title="응원 한도 (일일)">
          <div className={ADMIN_FIELD_CLASS}>
            <Label htmlFor="maxCheerPerUserDay">사용자 전체</Label>
            <Input
              id="maxCheerPerUserDay"
              type="number"
              min={0}
              required
              value={form.maxCheerPerUserDay}
              onChange={(e) =>
                setForm((f) =>
                  f ? { ...f, maxCheerPerUserDay: e.target.value } : f,
                )
              }
            />
          </div>
        </AdminFieldGroup>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-sm text-primary" role="status">
            저장되었습니다.
          </p>
        )}
        {updatedAt && (
          <p className="text-xs text-muted-foreground">
            마지막 수정: {formatKstDateTime(updatedAt)}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? '저장 중…' : '설정 저장'}
        </Button>
      </form>
    </AdminPanel>
  )
}
