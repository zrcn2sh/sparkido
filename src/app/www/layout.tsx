export const runtime = 'edge'

import { TopNav } from '@/components/common/TopNav'
import { SiteLayout } from '@/components/common/Layout'

export default function WwwLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SiteLayout>
      <TopNav variant="www" />
      {children}
    </SiteLayout>
  )
}
