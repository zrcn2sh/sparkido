import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonUnauthorized } from '@/lib/api'
import { getUserFuelBalance } from '@/lib/user-fuel'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const fuel = await getUserFuelBalance(userId)
    return NextResponse.json({ fuel })
  } catch (error) {
    console.error('[GET /api/users/me/fuel]', error)
    return NextResponse.json(
      { error: 'Fuel 정보를 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}
