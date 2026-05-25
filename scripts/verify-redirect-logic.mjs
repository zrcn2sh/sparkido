/**
 * 서브도메인 리다이렉트 검증
 * node scripts/verify-redirect-logic.mjs
 */

function isSparkSubdomainHost(host) {
  return host.startsWith('spark.')
}
function isInfoSubdomainHost(host) {
  return host.startsWith('info.')
}
function isBoardSubdomainHost(host) {
  return host.startsWith('board.')
}
function isAdminSubdomainHost(host) {
  return host.startsWith('admin.')
}
function isLocalDevHost(host) {
  return host.includes('localhost')
}
function isPathInfoRoute(pathname) {
  return pathname === '/info' || pathname.startsWith('/info/')
}
function isPathBoardRoute(pathname) {
  return pathname === '/board' || pathname.startsWith('/board/')
}
function isPathAdminRoute(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}
function isWwwHost(host) {
  if (isSparkSubdomainHost(host)) return false
  if (isInfoSubdomainHost(host)) return false
  if (isBoardSubdomainHost(host)) return false
  if (isAdminSubdomainHost(host)) return false
  return true
}
function isPathSparkRoute(pathname) {
  return pathname === '/spark' || pathname.startsWith('/spark/')
}
function isWwwOnlyPath(pathname) {
  return pathname === '/privacy' || pathname.startsWith('/privacy/')
}
function boardPathTail(pathname) {
  if (pathname === '/board') return '/'
  if (pathname.startsWith('/board/')) return pathname.slice('/board'.length) || '/'
  return pathname
}
function adminPathTail(pathname) {
  if (pathname === '/admin') return '/'
  if (pathname.startsWith('/admin/')) return pathname.slice('/admin'.length) || '/'
  return pathname
}
function shouldRedirectToSparkMain(pathname, host) {
  if (!isWwwHost(host)) return false
  if (isWwwOnlyPath(pathname)) return false
  if (isPathInfoRoute(pathname)) return false
  if (isPathBoardRoute(pathname)) return false
  if (isPathAdminRoute(pathname)) return false
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) return false
  if (pathname.startsWith('/onboarding') || pathname.startsWith('/settings') || pathname.startsWith('/api/')) return false
  if (host && isLocalDevHost(host)) return pathname === '/'
  return pathname === '/' || isPathSparkRoute(pathname)
}

function buildCrossSubdomainRedirect(pathname, host) {
  const info = 'https://info.idosquare.co.kr'
  const board = 'https://board.idosquare.co.kr'
  const admin = 'https://admin.idosquare.co.kr'
  if (isPathInfoRoute(pathname) && !isInfoSubdomainHost(host)) {
    const tail = pathname === '/info' ? '' : pathname.slice('/info'.length)
    return `${info}${tail || '/'}`
  }
  if (isPathBoardRoute(pathname) && !isBoardSubdomainHost(host)) {
    const tail = boardPathTail(pathname)
    return `${board}${tail === '/' ? '' : tail}`
  }
  if (isPathAdminRoute(pathname) && !isAdminSubdomainHost(host)) {
    const tail = adminPathTail(pathname)
    return `${admin}${tail === '/' ? '' : tail}`
  }
  return null
}

const host = 'localhost:3000'
if (shouldRedirectToSparkMain('/spark', host)) throw new Error('/spark must not redirect on local')
if (!shouldRedirectToSparkMain('/', host)) throw new Error('/ must redirect on local')
if (shouldRedirectToSparkMain('/board', host)) throw new Error('/board must not redirect on local')

const wwwBoard = buildCrossSubdomainRedirect('/board/free', 'www.idosquare.co.kr')
if (wwwBoard !== 'https://board.idosquare.co.kr/free') {
  throw new Error(`www /board should redirect to board subdomain, got ${wwwBoard}`)
}

const sparkAdmin = buildCrossSubdomainRedirect('/admin/members', 'spark.idosquare.co.kr')
if (sparkAdmin !== 'https://admin.idosquare.co.kr/members') {
  throw new Error(`spark /admin should redirect to admin subdomain, got ${sparkAdmin}`)
}

console.log('OK: redirect logic')
