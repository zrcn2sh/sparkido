import { AdminPageSection } from '@/components/admin/admin-layout'
import { AdminFuelSettingsForm } from '@/components/admin/AdminFuelSettingsForm'

export const dynamic = 'force-dynamic'

export default function AdminSettingsPage() {
  return (
    <AdminPageSection
      title="기본설정"
      description="사용자 Fuel 획득(Spark·Lab·응원하기), Show 타일 등록 소비 Fuel, 응원 한도를 관리합니다."
    >
      <AdminFuelSettingsForm />
    </AdminPageSection>
  )
}
