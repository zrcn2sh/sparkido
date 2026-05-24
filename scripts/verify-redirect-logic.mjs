/**
 * shouldRedirectToSparkMain 로컬 루프 방지 검증
 * node scripts/verify-redirect-logic.mjs
 */

function isLocalEnv() {
  return true
}
function isSparkSubdomainHost(host) {
  return host.startsWith('spark.')
}
function isLocalDevHost(host) {
  return host.includes('localhost')
}
function isWwwHost(host) {
  if (!host) return !isLocalEnv()
  if (isSparkSubdomainHost(host)) return false
  return true
}
function isPathSparkRoute(pathname) {
  return pathname === '/spark' || pathname.startsWith('/spark/')
}
function isWwwOnlyPath(pathname) {
  return pathname === '/info' || pathname.startsWith('/info/') || pathname === '/board' || pathname.startsWith('/board/')
}
function shouldRedirectToSparkMain(pathname, host) {
  if (!isWwwHost(host)) return false
  if (isWwwOnlyPath(pathname)) return false
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) return false
  if (pathname.startsWith('/onboarding') || pathname.startsWith('/settings') || pathname.startsWith('/api/')) return false
  const local = (host && isLocalDevHost(host)) || (!host && isLocalEnv())
  if (local) return pathname === '/'
  return pathname === '/' || isPathSparkRoute(pathname)
}

const host = 'localhost:3000'
if (shouldRedirectToSparkMain('/spark', host)) throw new Error('/spark must not redirect on local')
if (!shouldRedirectToSparkMain('/', host)) throw new Error('/ must redirect on local')
if (shouldRedirectToSparkMain('/info', host)) throw new Error('/info must not redirect')
console.log('OK: local redirect logic')
