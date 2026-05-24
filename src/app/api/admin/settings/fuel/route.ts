export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireAdminUserId } from '@/lib/admin-auth'
import {
  getFuelSettings,
  updateFuelSettings,
  validateFuelSettingsInput,
} from '@/lib/fuel-settings'

export async function GET() {
  try {
    const admin = await requireAdminUserId()
    if (!admin.ok) return admin.response

    const settings = await getFuelSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[GET /api/admin/settings/fuel]', error)
    return NextResponse.json(
      { error: 'Fuel 설정을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdminUserId()
    if (!admin.ok) return admin.response

    const body = (await request.json()) as { settings?: unknown }
    const validated = validateFuelSettingsInput(body.settings)
    if (!validated.ok) {
      return jsonError(validated.error, 400)
    }

    const settings = await updateFuelSettings(validated.value, admin.userId)
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[PUT /api/admin/settings/fuel]', error)
    return NextResponse.json(
      { error: 'Fuel 설정 저장에 실패했습니다.' },
      { status: 500 },
    )
  }
}
