import { redirect } from 'next/navigation'
import { DEFAULT_BOARD_CATEGORY } from '@/lib/board-categories'
import { getRequestHost } from '@/lib/request-host'
import { resolveBoardPath } from '@/lib/routes'

export default async function BoardIndexPage() {
  const host = await getRequestHost()
  redirect(resolveBoardPath(`/${DEFAULT_BOARD_CATEGORY}`, host))
}
