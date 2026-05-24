'use client'

import { Flame } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { USER_FUEL_CHANGED_EVENT } from '@/lib/user-fuel-events'
import { cn } from '@/lib/utils'

type FuelResponse = {
  fuel?: { available: number; total: number }
  error?: string
}

type UserFuelBadgeProps = {
  className?: string
}

export function UserFuelBadge({ className }: UserFuelBadgeProps) {
  const [available, setAvailable] = useState<number | null>(null)
  const [total, setTotal] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/users/me/fuel')
      const data = (await res.json()) as FuelResponse
      if (!res.ok || !data.fuel) return
      setAvailable(data.fuel.available)
      setTotal(data.fuel.total)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    void load()
    window.addEventListener(USER_FUEL_CHANGED_EVENT, load)
    window.addEventListener('focus', load)
    return () => {
      window.removeEventListener(USER_FUEL_CHANGED_EVENT, load)
      window.removeEventListener('focus', load)
    }
  }, [load])

  if (available === null || total === null) {
    return (
      <span
        className={cn(
          'inline-flex h-7 min-w-[4.5rem] animate-pulse rounded-md bg-muted',
          className,
        )}
        aria-hidden
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-md border border-orange-400/25 bg-orange-50/50 px-2 py-0.5 dark:bg-orange-950/30',
        className,
      )}
      title={`사용가능 Fuel ${available} / 누적 Fuel ${total}`}
    >
      <Flame
        className="size-3.5 shrink-0 fill-orange-500/25 text-orange-500"
        aria-hidden
      />
      <span
        className="font-mono text-xs font-medium tabular-nums text-orange-800 dark:text-orange-300"
        aria-label={`사용가능 Fuel ${available}, 누적 Fuel ${total}`}
      >
        <span className="text-orange-600 dark:text-orange-400">{available}</span>
        <span className="mx-0.5 text-muted-foreground/80">/</span>
        <span className="text-orange-700/90 dark:text-orange-400/90">
          {total}
        </span>
      </span>
    </div>
  )
}
