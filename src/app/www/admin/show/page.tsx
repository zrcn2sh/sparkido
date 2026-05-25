import { AdminShowPurgePanel } from '@/components/admin/AdminShowPurgePanel'
import { AdminPageSection } from '@/components/admin/admin-layout'
import { countActiveShowTiles } from '@/lib/show-tiles'

export const dynamic = 'force-dynamic'

export default async function AdminShowPage() {
  const activeTileCount = await countActiveShowTiles()

  return (
    <AdminPageSection
      title="Show 관리"
      description="Show 쇼케이스 타일을 관리합니다. 전체 삭제는 되돌릴 수 없으므로 신중히 실행하세요."
    >
      <AdminShowPurgePanel activeTileCount={activeTileCount} />
    </AdminPageSection>
  )
}
