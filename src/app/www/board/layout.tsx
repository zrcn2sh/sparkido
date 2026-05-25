import { BoardShell } from '@/components/board/BoardShell'

export default function BoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <BoardShell>{children}</BoardShell>
}
