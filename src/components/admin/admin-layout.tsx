import { cn } from '@/lib/utils'

/** Admin 본문(회원관리·기본설정) 공통 폭 */
export const ADMIN_CONTENT_CLASS = 'w-full min-w-0'

type AdminPageSectionProps = {
  title: string
  description: string
  children: React.ReactNode
}

export function AdminPageSection({
  title,
  description,
  children,
}: AdminPageSectionProps) {
  return (
    <section className={ADMIN_CONTENT_CLASS}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 w-full min-w-0">{children}</div>
    </section>
  )
}

type AdminPanelProps = {
  children: React.ReactNode
  className?: string
  /** 테이블 등 패딩 없이 꽉 채울 때 */
  flush?: boolean
}

export function AdminPanel({ children, className, flush }: AdminPanelProps) {
  return (
    <div
      className={cn(
        'box-border w-full max-w-none min-w-0 rounded-lg border border-border bg-card',
        flush ? 'overflow-hidden' : 'p-4 sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

type AdminFieldGroupProps = {
  title: string
  description?: string
  children: React.ReactNode
}

/** fieldset 대신 사용 — 브라우저 기본 min-width로 폼이 줄어드는 현상 방지 */
export function AdminFieldGroup({
  title,
  description,
  children,
}: AdminFieldGroupProps) {
  return (
    <div role="group" className="w-full min-w-0 space-y-4">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </div>
  )
}

export const ADMIN_FIELD_CLASS = 'min-w-0 w-full space-y-2'
