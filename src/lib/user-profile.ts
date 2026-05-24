import { clerkClient } from '@clerk/nextjs/server'
import { nowKstIso } from '@/lib/datetime'
import { getDb } from '@/lib/db'
import { NICKNAME_LIMITS } from '@/lib/nickname'
import { assertValidUtf8Text } from '@/lib/text'
import type { UserRole } from '@/types'

export { NICKNAME_LIMITS } from '@/lib/nickname'

export type UserProfile = {
  clerkUserId: string
  nickname: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

type UserProfileRow = {
  clerk_user_id: string
  nickname: string
  role: UserRole
  created_at: string
  updated_at: string
}

function mapRow(row: UserProfileRow): UserProfile {
  return {
    clerkUserId: row.clerk_user_id,
    nickname: row.nickname,
    role: row.role === 'admin' ? 'admin' : 'member',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function validateNicknameInput(
  raw: unknown,
): { ok: true; nickname: string } | { ok: false; error: string } {
  if (typeof raw !== 'string') {
    return { ok: false, error: '별명을 입력해 주세요.' }
  }
  const trimmed = raw.trim()
  if (trimmed.length < NICKNAME_LIMITS.min) {
    return {
      ok: false,
      error: `별명은 ${NICKNAME_LIMITS.min}자 이상 입력해 주세요.`,
    }
  }
  if (trimmed.length > NICKNAME_LIMITS.max) {
    return {
      ok: false,
      error: `별명은 ${NICKNAME_LIMITS.max}자 이하로 입력해 주세요.`,
    }
  }
  if (!/^[0-9A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ_\s.\-]+$/.test(trimmed)) {
    return {
      ok: false,
      error: '별명은 한글·영문·숫자·공백·_ . - 만 사용할 수 있습니다.',
    }
  }
  try {
    return {
      ok: true,
      nickname: assertValidUtf8Text(trimmed, '별명'),
    }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : '별명이 올바르지 않습니다.',
    }
  }
}

export async function getUserProfile(
  clerkUserId: string,
): Promise<UserProfile | null> {
  const db = await getDb()
  const row = await db
    .prepare(
      `SELECT clerk_user_id, nickname, role, created_at, updated_at
       FROM user_profiles WHERE clerk_user_id = ?`,
    )
    .bind(clerkUserId)
    .first<UserProfileRow>()
  return row ? mapRow(row) : null
}

export async function isNicknameTaken(
  nickname: string,
  excludeClerkUserId?: string,
): Promise<boolean> {
  const db = await getDb()
  if (excludeClerkUserId) {
    const row = await db
      .prepare(
        `SELECT 1 AS found FROM user_profiles
         WHERE LOWER(nickname) = LOWER(?) AND clerk_user_id != ?`,
      )
      .bind(nickname, excludeClerkUserId)
      .first<{ found: number }>()
    return !!row
  }
  const row = await db
    .prepare(
      `SELECT 1 AS found FROM user_profiles WHERE LOWER(nickname) = LOWER(?)`,
    )
    .bind(nickname)
    .first<{ found: number }>()
  return !!row
}

export async function hasUserProfile(clerkUserId: string): Promise<boolean> {
  const db = await getDb()
  const row = await db
    .prepare(`SELECT 1 AS found FROM user_profiles WHERE clerk_user_id = ?`)
    .bind(clerkUserId)
    .first<{ found: number }>()
  return !!row
}

export async function getNickname(clerkUserId: string): Promise<string | null> {
  const profile = await getUserProfile(clerkUserId)
  return profile?.nickname ?? null
}

export async function getNicknamesByUserIds(
  userIds: string[],
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {}
  const db = await getDb()
  const placeholders = userIds.map(() => '?').join(', ')
  const { results } = await db
    .prepare(
      `SELECT clerk_user_id, nickname FROM user_profiles
       WHERE clerk_user_id IN (${placeholders})`,
    )
    .bind(...userIds)
    .all<{ clerk_user_id: string; nickname: string }>()

  const map: Record<string, string> = {}
  for (const row of results ?? []) {
    map[row.clerk_user_id] = row.nickname
  }
  return map
}

async function syncClerkDisplayName(
  clerkUserId: string,
  nickname: string,
): Promise<void> {
  try {
    const client = await clerkClient()
    await client.users.updateUser(clerkUserId, {
      firstName: nickname,
      lastName: '',
      publicMetadata: { nickname },
    })
  } catch (error) {
    console.error('[syncClerkDisplayName]', error)
  }
}

/** Clerk 메뉴에 성(lastName)이 남아 있으면 별명만 보이도록 정리 */
export async function repairClerkDisplayNameIfNeeded(
  clerkUserId: string,
  nickname: string,
): Promise<void> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(clerkUserId)
    const needsRepair =
      !!user.lastName?.trim() ||
      user.firstName?.trim() !== nickname.trim()
    if (needsRepair) {
      await syncClerkDisplayName(clerkUserId, nickname)
    }
  } catch (error) {
    console.error('[repairClerkDisplayNameIfNeeded]', error)
  }
}

export async function upsertUserProfile(
  clerkUserId: string,
  nickname: string,
): Promise<UserProfile> {
  const validated = validateNicknameInput(nickname)
  if (!validated.ok) {
    throw new Error(validated.error)
  }

  if (await isNicknameTaken(validated.nickname, clerkUserId)) {
    throw new Error('이미 사용 중인 별명입니다.')
  }

  const db = await getDb()
  const now = nowKstIso()
  const existing = await getUserProfile(clerkUserId)

  if (existing) {
    await db
      .prepare(
        `UPDATE user_profiles SET nickname = ?, updated_at = ? WHERE clerk_user_id = ?`,
      )
      .bind(validated.nickname, now, clerkUserId)
      .run()
  } else {
    await db
      .prepare(
        `INSERT INTO user_profiles (clerk_user_id, nickname, role, created_at, updated_at)
         VALUES (?, ?, 'member', ?, ?)`,
      )
      .bind(clerkUserId, validated.nickname, now, now)
      .run()
  }

  await syncClerkDisplayName(clerkUserId, validated.nickname)

  const profile = await getUserProfile(clerkUserId)
  if (!profile) throw new Error('별명 저장 후 조회에 실패했습니다.')
  return profile
}
