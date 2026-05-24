export const runtime = 'edge'

import { AdminFuelLedgerPanel } from '@/components/admin/AdminFuelLedgerPanel'
import { AdminPageSection } from '@/components/admin/admin-layout'
import { listAdminMembers } from '@/lib/admin-users'
import { todayKstDateString } from '@/lib/admin-fuel-ledger'

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

export default async function AdminFuelLedgerPage() {
  const members = await listAdminMembers()
  const defaultTo = todayKstDateString()
  const defaultFrom = defaultDateFrom()

  return (
    <AdminPageSection
      title="Fuel 이력"
      description="사용자별·기간별 Fuel 적립·사용·환불 원장을 조회합니다. 사용자를 선택하면 현재 사용 가능 Fuel과 누적 Fuel을 함께 표시합니다."
    >
      <AdminFuelLedgerPanel
        members={members}
        defaultDateFrom={defaultFrom}
        defaultDateTo={defaultTo}
      />
    </AdminPageSection>
  )
}
