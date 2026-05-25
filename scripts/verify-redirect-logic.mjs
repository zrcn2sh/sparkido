/**
 * shouldRedirectToSparkMain · info 서브도메인 리다이렉트 검증
 * node scripts/verify-redirect-logic.mjs
 */

function isLocalEnv() {
  return true
}
function isSparkSubdomainHost(host) {
  return host.startsWith('spark.')
}
function isInfoSubdomainHost(host) {
  return host.startsWith('info.')
}
function isLocalDevHost(host) {
  return host.includes('localhost')
}
function isPathInfoRoute(pathname) {
  return pathname === '/info' || pathname.startsWith('/info/')
}
function isWwwHost(host) {
  if (!host) return !isLocalEnv()
  if (isSparkSubdomainHost(host)) return false
  if (isInfoSubdomainHost(host)) return false
  return true
}
function isPathSparkRoute(pathname) {
  return pathname === '/spark' || pathname.startsWith('/spark/')
}
function isWwwOnlyPath(pathname) {
  return pathname === '/board' || pathname.startsWith('/board/')
}
function shouldRedirectToSparkMain(pathname, host) {
  if (!isWwwHost(host)) return false
  if (isWwwOnlyPath(pathname)) return false
  if (isPathInfoRoute(pathname)) return false
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) return false
  if (pathname.startsWith('/onboarding') || pathname.startsWith('/settings') || pathname.startsWith('/api/')) return false
  const local = (host && isLocalDevHost(host)) || (!host && isLocalEnv())
  if (local) return pathname === '/'
  return pathname === '/' || isPathSparkRoute(pathname)
}

function buildCrossSubdomainRedirect(pathname, host) {
  const info = 'https://info.idosquare.co.kr'
  if (isPathInfoRoute(pathname) && !isInfoSubdomainHost(host)) {
    const tail = pathname === '/info' ? '' : pathname.slice('/info'.length)
    return `${info}${tail || '/'}`
  }
  return null
}

const host = 'localhost:3000'
if (shouldRedirectToSparkMain('/spark', host)) throw new Error('/spark must not redirect on local')
if (!shouldRedirectToSparkMain('/', host)) throw new Error('/ must redirect on local')
if (shouldRedirectToSparkMain('/info', host)) throw new Error('/info must not redirect on local')

const wwwInfo = buildCrossSubdomainRedirect('/info', 'www.idosquare.co.kr')
if (wwwInfo !== 'https://info.idosquare.co.kr/') {
  throw new Error(`www /info should redirect to info subdomain, got ${wwwInfo}`)
}

console.log('OK: redirect logic')
