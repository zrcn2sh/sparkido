import { TopNav } from '@/components/common/TopNav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Show',
  description: 'idosquare 멤버가 만든 서비스와 앱을 보여주는 쇼케이스',
}

export default function ShowLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav variant="show" />
      {children}
    </div>
  )
}
