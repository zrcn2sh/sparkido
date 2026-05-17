import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const ENERGY_TYPES = ['응원하기', '기술 지원', '시장성 확인'] as const

type FuelBoostProps = {
  sparkId: string
  voltage: number
  variant: 'sidebar' | 'mobile'
  className?: string
}

function VoltageMeter({ voltage }: { voltage: number }) {
  const max = 100
  const pct = Math.min(100, Math.round((voltage / max) * 100))

  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">전압 (Voltage)</span>
        <span className="font-mono text-sm font-medium text-pink-800 dark:text-pink-400">
          {voltage}V
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-pink-50 dark:bg-pink-950/40"
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`관심도 ${pct}%`}
      >
        <div
          className="h-full rounded-full bg-pink-400 transition-[width]"
          style={{ width: `${Math.max(pct, voltage > 0 ? 8 : 0)}%` }}
        />
      </div>
    </div>
  )
}

function FuelPanel({ sparkId, voltage }: { sparkId: string; voltage: number }) {
  return (
    <>
      <VoltageMeter voltage={voltage} />
      <div className="mt-4 flex flex-col gap-2">
        {ENERGY_TYPES.map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="justify-start border-pink-400/20 text-pink-800/80 hover:bg-pink-50/50 dark:text-pink-300"
            title="Phase 2에서 활성화"
          >
            {type}
          </Button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        리액션 누적 시 Spark 관심도가 올라갑니다.
      </p>
      <span className="sr-only">Spark ID: {sparkId}</span>
    </>
  )
}

export function FuelBoost({
  sparkId,
  voltage,
  variant,
  className,
}: FuelBoostProps) {
  if (variant === 'mobile') {
    return (
      <details
        className={cn(
          'group rounded-lg border-hairline border border-pink-400/25 bg-card shadow-linear',
          className,
        )}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="text-pink-800 dark:text-pink-400">Fuel & Boost</span>
          <span className="font-mono text-xs text-muted-foreground">
            {voltage}V
          </span>
        </summary>
        <div className="border-t border-pink-400/15 px-4 pb-4 pt-3">
          <FuelPanel sparkId={sparkId} voltage={voltage} />
        </div>
      </details>
    )
  }

  return (
    <Card
      className={cn(
        'border-hairline border-pink-400/25 bg-card shadow-linear',
        className,
      )}
    >
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-base text-pink-800 dark:text-pink-400">
          Fuel & Boost
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <FuelPanel sparkId={sparkId} voltage={voltage} />
      </CardContent>
    </Card>
  )
}
