import { Badge } from '@/components/ui/badge'
import { getRoleLabel } from '@/lib/role-labels'
import type { UserRole } from '@/types'
import { cn } from '@/lib/utils'

type UserRoleBadgeProps = {
  role: UserRole
  className?: string
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  return (
    <Badge
      variant={role === 'admin' ? 'default' : 'secondary'}
      className={cn('font-medium', className)}
    >
      {getRoleLabel(role)}
    </Badge>
  )
}
