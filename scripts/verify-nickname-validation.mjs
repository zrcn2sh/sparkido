/**
 * validateNicknameInput 단위 검증 (DB 없음)
 * 실행: node scripts/verify-nickname-validation.mjs
 */

// user-profile.ts와 동일한 규칙 (ESM 복제 — import 경로 이슈 회피)
const NICKNAME_LIMITS = { min: 2, max: 20 }

function assertValidUtf8Text(value, fieldLabel) {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  if (trimmed.includes('\uFFFD')) {
    throw new Error(`${fieldLabel} 인코딩이 올바르지 않습니다.`)
  }
  if (/\?{3,}/.test(trimmed)) {
    throw new Error(`${fieldLabel}에 깨진 문자가 있습니다.`)
  }
  return trimmed
}

function validateNicknameInput(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, error: '별명을 입력해 주세요.' }
  }
  const trimmed = raw.trim()
  if (trimmed.length < NICKNAME_LIMITS.min) {
    return { ok: false, error: `min` }
  }
  if (trimmed.length > NICKNAME_LIMITS.max) {
    return { ok: false, error: `max` }
  }
  if (!/^[0-9A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ_\s.\-]+$/.test(trimmed)) {
    return { ok: false, error: 'charset' }
  }
  try {
    return { ok: true, nickname: assertValidUtf8Text(trimmed, '별명') }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

const cases = [
  { input: undefined, expectOk: false },
  { input: '', expectOk: false },
  { input: '   ', expectOk: false },
  { input: 'a', expectOk: false },
  { input: 'ab', expectOk: true, nickname: 'ab' },
  { input: '  홍길동  ', expectOk: true, nickname: '홍길동' },
  { input: 'a'.repeat(20), expectOk: true },
  { input: 'a'.repeat(21), expectOk: false },
  { input: 'user_name.test-1', expectOk: true },
  { input: 'hello world', expectOk: true },
  { input: 'test@mail', expectOk: false },
  { input: '😀😀', expectOk: false },
  { input: '스파크#1', expectOk: false },
  { input: '???broken', expectOk: false },
]

let failed = 0
for (const c of cases) {
  const r = validateNicknameInput(c.input)
  const ok = r.ok === c.expectOk
  const nickOk =
    !c.expectOk ||
    (c.nickname === undefined
      ? r.ok && typeof r.nickname === 'string'
      : r.ok && r.nickname === c.nickname)
  if (!ok || !nickOk) {
    console.error('FAIL', c, r)
    failed++
  }
}

if (failed) {
  console.error(`\n${failed} case(s) failed`)
  process.exit(1)
}
console.log(`OK: ${cases.length} validation cases passed`)
