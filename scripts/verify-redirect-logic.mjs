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

function resolveInternalPathname(pathname, host) {
  if (host.startsWith('info.')) {
    if (pathname === '/') return '/www/info'
    return `/www/info${pathname}`
  }
  if (host.startsWith('board.')) {
    if (pathname === '/') return '/www/board'
    const isPathBoardRoute =
      pathname === '/board' || pathname.startsWith('/board/')
    if (isPathBoardRoute) return `/www${pathname}`
    return `/www/board${pathname}`
  }
  if (host.startsWith('admin.')) {
    if (pathname === '/') return '/www/admin'
    const isPathAdminRoute =
      pathname === '/admin' || pathname.startsWith('/admin/')
    if (isPathAdminRoute) return `/www${pathname}`
    return `/www/admin${pathname}`
  }
  if (host.startsWith('show.')) {
    if (pathname === '/') return '/show'
    return `/show${pathname}`
  }
  return pathname
}

const adminSettings = resolveInternalPathname(
  '/settings',
  'admin.idosquare.co.kr',
)
if (adminSettings !== '/www/admin/settings') {
  throw new Error(
    `admin /settings should rewrite to /www/admin/settings, got ${adminSettings}`,
  )
}

function isPublicBrowsingSubdomainHost(host) {
  return (
    host.startsWith('info.') ||
    host.startsWith('show.') ||
    host.startsWith('board.')
  )
}

if (!isPublicBrowsingSubdomainHost('info.idosquare.co.kr')) {
  throw new Error('info should be public browsing host')
}
if (isPublicBrowsingSubdomainHost('admin.idosquare.co.kr')) {
  throw new Error('admin should not be public browsing host')
}

const showRoot = resolveInternalPathname('/', 'show.idosquare.co.kr')
if (showRoot !== '/show') {
  throw new Error(`show / should rewrite to /show, got ${showRoot}`)
}

const boardRoot = resolveInternalPathname('/', 'board.idosquare.co.kr')
if (boardRoot !== '/www/board') {
  throw new Error(`board / should rewrite to /www/board, got ${boardRoot}`)
}

console.log('OK: redirect logic')
