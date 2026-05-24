import { NextResponse } from 'next/server'
import { requireAdminUserId } from '@/lib/admin-auth'
import { searchAdminFuelLedger } from '@/lib/admin-fuel-ledger'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const admin = await requireAdminUserId()
    if (!admin.ok) return admin.response

    const { searchParams } = new URL(request.url)
    const clerkUserId = searchParams.get('clerkUserId') ?? undefined
    const dateFrom = searchParams.get('dateFrom') ?? undefined
    const dateTo = searchParams.get('dateTo') ?? undefined
    const limit = Number(searchParams.get('limit') ?? '50')
    const offset = Number(searchParams.get('offset') ?? '0')

    const result = await searchAdminFuelLedger({
      clerkUserId,
      dateFrom,
      dateTo,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[GET /api/admin/fuel/ledger]', error)
    return NextResponse.json(
      { error: 'Fuel 이력을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}
