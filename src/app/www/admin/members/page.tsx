export const runtime = 'edge'

import { AdminPageSection } from '@/components/admin/admin-layout'
import { AdminMemberTable } from '@/components/admin/AdminMemberTable'
import { listAdminMembers } from '@/lib/admin-users'

export const dynamic = 'force-dynamic'

export default async function AdminMembersPage() {
  const members = await listAdminMembers()

  return (
    <AdminPageSection
      title="회원관리"
      description="별명을 등록한 회원 목록을 조회하고, 현재 권한을 확인·변경할 수 있습니다."
    >
      <AdminMemberTable initialMembers={members} />
    </AdminPageSection>
  )
}
