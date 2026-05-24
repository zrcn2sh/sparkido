import { NextResponse } from 'next/server'
import { requireAdminUserId } from '@/lib/admin-auth'
import {
  searchAdminShowTileEvents,
  type AdminShowTileEventsQuery,
} from '@/lib/admin-show-tile-events'
import type { ShowTileEventAction } from '@/lib/show-tile-events'

export const runtime = 'nodejs'

const ACTIONS: ShowTileEventAction[] = ['register', 'cancel', 'purge_all']

function parseAction(raw: string | null): ShowTileEventAction | undefined {
  if (!raw) return undefined
  return ACTIONS.includes(raw as ShowTileEventAction)
    ? (raw as ShowTileEventAction)
    : undefined
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdminUserId()
    if (!admin.ok) return admin.response

    const { searchParams } = new URL(request.url)
    const query: AdminShowTileEventsQuery = {
      clerkUserId: searchParams.get('clerkUserId') ?? undefined,
      action: parseAction(searchParams.get('action')),
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
      limit: Number(searchParams.get('limit') ?? '50'),
      offset: Number(searchParams.get('offset') ?? '0'),
    }

    const result = await searchAdminShowTileEvents({
      ...query,
      limit: Number.isFinite(query.limit) ? query.limit : 50,
      offset: Number.isFinite(query.offset) ? query.offset : 0,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[GET /api/admin/show/events]', error)
    return NextResponse.json(
      { error: 'Show 이력을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}
