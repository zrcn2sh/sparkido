import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonUnauthorized } from '@/lib/api'
import { getPendingSignupFuelToast } from '@/lib/fuel-auth-rewards'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const toast = await getPendingSignupFuelToast(userId)
    return NextResponse.json(toast)
  } catch (error) {
    console.error('[GET /api/users/me/fuel/signup-toast]', error)
    return NextResponse.json(
      { show: false, amount: 0, ledgerId: null },
      { status: 500 },
    )
  }
}
