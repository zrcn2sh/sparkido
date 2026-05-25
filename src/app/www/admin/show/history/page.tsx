import { AdminShowTileEventsPanel } from '@/components/admin/AdminShowTileEventsPanel'
import { AdminPageSection } from '@/components/admin/admin-layout'
import { todayKstDateString } from '@/lib/admin-fuel-ledger'
import { listAdminMembers } from '@/lib/admin-users'

export const dynamic = 'force-dynamic'

function defaultDateFrom(): string {
  const to = todayKstDateString()
  const [y, m, d] = to.split('-').map(Number)
  const from = new Date(y, m - 1, d)
  from.setDate(from.getDate() - 29)
  const fy = from.getFullYear()
  const fm = String(from.getMonth() + 1).padStart(2, '0')
  const fd = String(from.getDate()).padStart(2, '0')
  return `${fy}-${fm}-${fd}`
}

export default async function AdminShowHistoryPage() {
  const members = await listAdminMembers()
  const defaultTo = todayKstDateString()
  const defaultFrom = defaultDateFrom()

  return (
    <AdminPageSection
      title="Show 이력"
      description="Show 타일 등록·게시 취소·전체 삭제 이력을 조회합니다. 등록자(소유자) 기준으로 필터할 수 있습니다."
    >
      <AdminShowTileEventsPanel
        members={members}
        defaultDateFrom={defaultFrom}
        defaultDateTo={defaultTo}
      />
    </AdminPageSection>
  )
}
