export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { DEFAULT_BOARD_CATEGORY } from '@/lib/board-categories'

export default function BoardIndexPage() {
  redirect(`/board/${DEFAULT_BOARD_CATEGORY}`)
}
