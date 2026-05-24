export const runtime = 'edge'

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { jsonUnauthorized } from '@/lib/api'
import { getUserRole } from '@/lib/user-role'
import {
  getUserProfile,
  repairClerkDisplayNameIfNeeded,
  upsertUserProfile,
  validateNicknameInput,
} from '@/lib/user-profile'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const [profile, role] = await Promise.all([
      getUserProfile(userId),
      getUserRole(userId),
    ])
    if (profile) {
      void repairClerkDisplayNameIfNeeded(userId, profile.nickname)
    }
    return NextResponse.json({ profile, role })
  } catch (error) {
    console.error('[GET /api/users/me/nickname]', error)
    return NextResponse.json(
      { error: '프로필을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return jsonUnauthorized()

    const body = (await request.json()) as { nickname?: string }
    const validated = validateNicknameInput(body.nickname)
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }

    const profile = await upsertUserProfile(userId, validated.nickname)
    const role = await getUserRole(userId)
    return NextResponse.json({ profile, role })
  } catch (error) {
    console.error('[POST /api/users/me/nickname]', error)
    const message =
      error instanceof Error ? error.message : '별명 저장에 실패했습니다.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
