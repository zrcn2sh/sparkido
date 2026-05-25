import Link from 'next/link'
import { AdminNav } from '@/components/admin/AdminNav'
import { UserRoleBadge } from '@/components/auth/UserRoleBadge'
import { Button } from '@/components/ui/button'
import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { resolveSparkPath } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

type AdminShellProps = {
  role: UserRole
  host: string
  children: React.ReactNode
}

export function AdminShell({ role, host, children }: AdminShellProps) {
  return (
    <div
      className={cn(
        'mx-auto py-12',
        SITE_MAX_WIDTH_CLASS,
        SITE_HORIZONTAL_PADDING_CLASS,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Admin</h1>
        <UserRoleBadge role={role} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[11rem_minmax(0,1fr)] md:items-start">
        <AdminNav host={host} />
        <div className="min-w-0 w-full">{children}</div>
      </div>

      <Button
        className="mt-10"
        variant="outline"
        size="sm"
        render={<Link href={resolveSparkPath('/', host)} />}
      >
        Spark로 돌아가기
      </Button>
    </div>
  )
}
