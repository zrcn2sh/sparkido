/**
 * 세션 앵커 만료 로직 검증
 * node scripts/verify-session-anchor.mjs
 */

const MAX = 3 * 60 * 60

function parse(value, sessionId) {
  if (!value) return null
  const sep = value.indexOf(':')
  if (sep < 0) return null
  const sid = value.slice(0, sep)
  const ts = Number.parseInt(value.slice(sep + 1), 10)
  if (sid !== sessionId || !Number.isFinite(ts)) return null
  return ts
}

function expired(anchor, now) {
  return now - anchor > MAX
}

const sid = 'sess_1'
const anchor = 1_000_000
const cookie = `${sid}:${anchor}`

if (parse(cookie, sid) !== anchor) throw new Error('parse fail')
if (parse(cookie, 'other') !== null) throw new Error('sid mismatch')
if (!expired(anchor, anchor + MAX + 1)) throw new Error('should expire')
if (expired(anchor, anchor + MAX)) throw new Error('should not expire at boundary')

console.log('OK: session anchor (3h =', MAX, 'seconds)')
