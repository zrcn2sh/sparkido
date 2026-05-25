import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IdoSquare - 앱 소개',
  description: '바이브 코딩으로 만든 IdoSquare 앱 소개 및 다운로드',
}

export default function LinkLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
