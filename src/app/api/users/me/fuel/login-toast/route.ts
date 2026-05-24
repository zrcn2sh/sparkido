export const runtime = 'edge'

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonUnauthorized } from '@/lib/api'
import { getPendingLoginFuelToast } from '@/lib/fuel-auth-rewards'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const toast = await getPendingLoginFuelToast(userId)
    return NextResponse.json(toast)
  } catch (error) {
    console.error('[GET /api/users/me/fuel/login-toast]', error)
    return NextResponse.json(
      { show: false, amount: 0, ledgerId: null },
      { status: 500 },
    )
  }
}
