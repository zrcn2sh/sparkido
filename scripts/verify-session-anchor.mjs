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
const anchor = Math.floor(Date.now() / 1000) - 60
const cookie = `${sid}:${anchor}`

if (parse(cookie, sid) !== anchor) throw new Error('parse fail')
if (parse(cookie, 'other') !== null) throw new Error('sid mismatch')
if (!expired(anchor, anchor + MAX + 1)) throw new Error('should expire')
if (expired(anchor, anchor + MAX)) throw new Error('should not expire at boundary')

function isSessionExpiredByAnchor(sessionId, anchorCookieValue) {
  const now = Math.floor(Date.now() / 1000)
  if (!sessionId) {
    return { expired: false, needsSetCookie: false }
  }
  const parsed = parse(anchorCookieValue, sessionId)
  if (parsed == null) {
    return { expired: false, needsSetCookie: true }
  }
  return { expired: expired(parsed, now), needsSetCookie: false }
}

if (isSessionExpiredByAnchor(null, undefined).expired) {
  throw new Error('no sessionId must not expire')
}
if (isSessionExpiredByAnchor(sid, undefined).expired) {
  throw new Error('missing cookie must not expire')
}
if (!isSessionExpiredByAnchor(sid, undefined).needsSetCookie) {
  throw new Error('missing cookie must need set')
}
if (isSessionExpiredByAnchor(sid, `${sid}:${anchor}`).expired) {
  throw new Error('valid anchor must not expire')
}
const old = `${sid}:${anchor - MAX - 1}`
if (!isSessionExpiredByAnchor(sid, old).expired) {
  throw new Error('old anchor must expire')
}

console.log('OK: session anchor (3h =', MAX, 'seconds)')
