import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IdoSquare 도움말',
  description: 'IdoSquare 앱별 사용 매뉴얼',
}

export default function HelpLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
