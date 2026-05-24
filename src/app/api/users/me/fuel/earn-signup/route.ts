export const runtime = 'edge'

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonUnauthorized } from '@/lib/api'
import { tryEarnSignupFuelForUser } from '@/lib/fuel-auth-rewards'

export const dynamic = 'force-dynamic'

/** 회원가입 Fuel 적립 (계정당 1회) — 웹훅 없을 때 백업 */
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const result = await tryEarnSignupFuelForUser(userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[POST /api/users/me/fuel/earn-signup]', error)
    return NextResponse.json(
      { awarded: false, amount: 0, error: '회원가입 Fuel 적립에 실패했습니다.' },
      { status: 500 },
    )
  }
}
