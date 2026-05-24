/**
 * D1 upsert/get/hasUserProfile 통합 검증 (로컬)
 * 실행: node scripts/verify-nickname-db.mjs
 */
import { getPlatformProxy } from 'wrangler'

const TEST_USER = '__verify_nickname_test__'

function nowKstIso() {
  return new Date().toISOString()
}

async function main() {
  const { env } = await getPlatformProxy({ configPath: 'wrangler.toml' })
  const db = env.DB
  if (!db) throw new Error('D1 binding DB missing')

  const nickname = '검증닉'
  const now = nowKstIso()

  await db
    .prepare(`DELETE FROM user_profiles WHERE clerk_user_id = ?`)
    .bind(TEST_USER)
    .run()

  const before = await db
    .prepare(`SELECT 1 AS found FROM user_profiles WHERE clerk_user_id = ?`)
    .bind(TEST_USER)
    .first()
  if (before) throw new Error('cleanup failed')

  await db
    .prepare(
      `INSERT INTO user_profiles (clerk_user_id, nickname, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(TEST_USER, nickname, now, now)
    .run()

  const row = await db
    .prepare(
      `SELECT clerk_user_id, nickname FROM user_profiles WHERE clerk_user_id = ?`,
    )
    .bind(TEST_USER)
    .first()

  if (!row?.nickname || row.nickname !== nickname) {
    throw new Error(`insert read mismatch: ${JSON.stringify(row)}`)
  }

  const updated = '검증2'
  const now2 = nowKstIso()
  await db
    .prepare(
      `UPDATE user_profiles SET nickname = ?, updated_at = ? WHERE clerk_user_id = ?`,
    )
    .bind(updated, now2, TEST_USER)
    .run()

  const row2 = await db
    .prepare(`SELECT nickname FROM user_profiles WHERE clerk_user_id = ?`)
    .bind(TEST_USER)
    .first()

  if (row2?.nickname !== updated) {
    throw new Error(`update mismatch: ${JSON.stringify(row2)}`)
  }

  await db
    .prepare(`DELETE FROM user_profiles WHERE clerk_user_id = ?`)
    .bind(TEST_USER)
    .run()

  const after = await db
    .prepare(`SELECT 1 AS found FROM user_profiles WHERE clerk_user_id = ?`)
    .bind(TEST_USER)
    .first()
  if (after) throw new Error('delete failed')

  console.log('OK: D1 insert/update/delete/hasProfile flow')
}

main().catch((e) => {
  console.error('FAIL:', e.message || e)
  process.exit(1)
})
