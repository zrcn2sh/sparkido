export const runtime = 'edge'

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonUnauthorized } from '@/lib/api'
import { tryEarnLoginFuelForUser } from '@/lib/fuel-auth-rewards'

export const dynamic = 'force-dynamic'

/** 로그인 Fuel 적립 (KST 1일 1회) — 웹훅 없을 때 클라이언트·앱 진입 백업 */
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const result = await tryEarnLoginFuelForUser(userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[POST /api/users/me/fuel/earn-login]', error)
    return NextResponse.json(
      { awarded: false, amount: 0, error: '로그인 Fuel 적립에 실패했습니다.' },
      { status: 500 },
    )
  }
}
