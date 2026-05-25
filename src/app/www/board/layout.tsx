import { BoardShell } from '@/components/board/BoardShell'
import { getRequestHost } from '@/lib/request-host'

export default async function BoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const host = await getRequestHost()
  return <BoardShell host={host}>{children}</BoardShell>
}
