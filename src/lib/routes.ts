function isLocalEnv() {
  const www = process.env.NEXT_PUBLIC_WWW_URL ?? ''
  return www.includes('localhost') || www.includes('127.0.0.1')
}

export function isSparkSubdomainHost(host: string) {
  return host.startsWith('spark.')
}

export function isShowSubdomainHost(host: string) {
  return host.startsWith('show.')
}

export function isInfoSubdomainHost(host: string) {
  return host.startsWith('info.')
}

export function isBoardSubdomainHost(host: string) {
  return host.startsWith('board.')
}

export function isAdminSubdomainHost(host: string) {
  return host.startsWith('admin.')
}

/** 로그인 없이 열람 가능 — 커스텀 세션 타임아웃(앵커) 미적용 대상 */
export function isPublicBrowsingSubdomainHost(host: string) {
  return (
    isInfoSubdomainHost(host) ||
    isShowSubdomainHost(host) ||
    isBoardSubdomainHost(host)
  )
}

/** apex (서브도메인 없음) — www와 동일 라우팅 */
export function isApexIdosquareHost(host: string) {
  const bare = host.split(':')[0]
  return bare === 'idosquare.co.kr'
}

export function isWwwSubdomainHost(host: string) {
  return host.startsWith('www.')
}

export function isPathShowRoute(pathname: string) {
  return pathname === '/show' || pathname.startsWith('/show/')
}

export function isPathInfoRoute(pathname: string) {
  return pathname === '/info' || pathname.startsWith('/info/')
}

export function isPathBoardRoute(pathname: string) {
  return pathname === '/board' || pathname.startsWith('/board/')
}

export function isPathAdminRoute(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

/** Spark 사용자 설정 (닉네임·프로필). admin `/settings`와 구분 */
export function isUserSettingsPath(pathname: string) {
  return (
    pathname === '/settings/profile' ||
    pathname.startsWith('/settings/profile/')
  )
}

/** admin 서브도메인 공개 경로 (`/admin` 접두어 없음) */
export function isAdminSubdomainPublicPath(pathname: string) {
  if (pathname === '/members' || pathname.startsWith('/members/')) {
    return true
  }
  if (pathname === '/fuel' || pathname.startsWith('/fuel/')) {
    return true
  }
  if (pathname === '/show' || pathname.startsWith('/show/')) {
    return true
  }
  if (pathname === '/settings' || pathname.startsWith('/settings/')) {
    return true
  }
  return false
}

export function isLocalDevHost(host: string) {
  return host.includes('localhost') || host.includes('127.0.0.1')
}

/** 단일 오리진에서 경로로 구분 (localhost, *.workers.dev) */
export function isPathBasedNavigationHost(host: string) {
  return (
    (host && isLocalDevHost(host)) ||
    (!host && isLocalEnv()) ||
    host.endsWith('.workers.dev')
  )
}

function infoPublicBase(): string {
  return (
    process.env.NEXT_PUBLIC_INFO_URL ?? 'https://info.idosquare.co.kr'
  ).replace(/\/$/, '')
}

function boardPublicBase(): string {
  return (
    process.env.NEXT_PUBLIC_BOARD_URL ?? 'https://board.idosquare.co.kr'
  ).replace(/\/$/, '')
}

function adminPublicBase(): string {
  return (
    process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://admin.idosquare.co.kr'
  ).replace(/\/$/, '')
}

/** /board 접두어 제거 후 서브경로만 반환 */
function boardPathTail(pathname: string): string {
  if (pathname === '/board') return '/'
  if (pathname.startsWith('/board/')) {
    return pathname.slice('/board'.length) || '/'
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

/** /admin 접두어 제거 */
function adminPathTail(pathname: string): string {
  if (pathname === '/admin') return '/'
  if (pathname.startsWith('/admin/')) {
    return pathname.slice('/admin'.length) || '/'
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

/**
 * 프로덕션: 잘못된 서브도메인+경로 조합 → 올바른 호스트로 이동
 */
export function buildCrossSubdomainRedirect(
  pathname: string,
  host: string,
): string | null {
  if (!host || isPathBasedNavigationHost(host)) return null

  const www = (process.env.NEXT_PUBLIC_WWW_URL ?? '').replace(/\/$/, '')
  const spark = (process.env.NEXT_PUBLIC_SPARK_URL ?? '').replace(/\/$/, '')
  const show = (process.env.NEXT_PUBLIC_SHOW_URL ?? '').replace(/\/$/, '')
  const info = infoPublicBase()
  const board = boardPublicBase()
  const admin = adminPublicBase()

  if (isPathInfoRoute(pathname) && !isInfoSubdomainHost(host)) {
    if (!info) return null
    const tail = pathname === '/info' ? '' : pathname.slice('/info'.length)
    return `${info}${tail || '/'}`
  }

  if (isPathBoardRoute(pathname) && !isBoardSubdomainHost(host)) {
    if (!board) return null
    const tail = boardPathTail(pathname)
    return `${board}${tail === '/' ? '' : tail}`
  }

  if (isPathAdminRoute(pathname) && !isAdminSubdomainHost(host)) {
    if (!admin) return null
    const tail = adminPathTail(pathname)
    return `${admin}${tail === '/' ? '' : tail}`
  }

  if (isWwwPrivacyPath(pathname) && !isWwwHost(host)) {
    if (!www) return null
    return `${www}${pathname}`
  }

  if (isPathShowRoute(pathname) && isWwwHost(host)) {
    if (!show) return null
    const tail = pathname === '/show' ? '' : pathname.slice('/show'.length)
    return `${show}${tail || '/'}`
  }

  if (isPathSparkRoute(pathname) && isShowSubdomainHost(host)) {
    if (!spark) return null
    const tail = pathname.slice('/spark'.length) || '/'
    return `${spark}${tail}`
  }

  if (isPathShowRoute(pathname) && isSparkSubdomainHost(host)) {
    if (!show) return null
    const tail = pathname === '/show' ? '' : pathname.slice('/show'.length)
    return `${show}${tail || '/'}`
  }

  return null
}

/**
 * apex(idosquare.co.kr) → www.idosquare.co.kr (Worker에 apex가 연결된 경우)
 */
export function buildApexToWwwRedirect(
  pathname: string,
  host: string,
  search = '',
): string | null {
  if (!isApexIdosquareHost(host) || isPathBasedNavigationHost(host)) return null
  const www = (process.env.NEXT_PUBLIC_WWW_URL ?? 'https://www.idosquare.co.kr').replace(
    /\/$/,
    '',
  )
  if (!www) return null
  return `${www}${pathname}${search}`
}

/** www 호스트(로컬 localhost·apex 포함, 다른 서브도메인 제외) */
export function isWwwHost(host: string) {
  if (!host) return !isLocalEnv()
  if (isSparkSubdomainHost(host)) return false
  if (isShowSubdomainHost(host)) return false
  if (isInfoSubdomainHost(host)) return false
  if (isBoardSubdomainHost(host)) return false
  if (isAdminSubdomainHost(host)) return false
  return true
}

export function isPathSparkRoute(pathname: string) {
  return pathname === '/spark' || pathname.startsWith('/spark/')
}

export function isWwwInfoPath(pathname: string) {
  return isPathInfoRoute(pathname)
}

export function isWwwBoardPath(pathname: string) {
  return isPathBoardRoute(pathname)
}

export function isWwwAdminPath(pathname: string) {
  return isPathAdminRoute(pathname)
}

export function isWwwPrivacyPath(pathname: string) {
  return pathname === '/privacy' || pathname.startsWith('/privacy/')
}

/** www 전용 경로: 개인정보 (board·admin·info는 각 서브도메인) */
export function isWwwOnlyPath(pathname: string) {
  return isWwwPrivacyPath(pathname)
}

/**
 * www 루트 또는 /spark/* 접속 시 Spark 메인으로 보낼 URL
 */
export function buildSparkRedirectUrl(pathname: string, host = ''): string {
  const sparkBase = (
    process.env.NEXT_PUBLIC_SPARK_URL ?? 'https://spark.idosquare.co.kr'
  ).replace(/\/$/, '')

  let subpath = '/'
  if (isPathSparkRoute(pathname)) {
    subpath = pathname.slice('/spark'.length) || '/'
  }

  const onSparkSubdomain = host && isSparkSubdomainHost(host)

  if (onSparkSubdomain) {
    return subpath
  }

  if (isPathBasedNavigationHost(host)) {
    return subpath === '/' ? '/spark' : `/spark${subpath}`
  }

  return subpath === '/' ? sparkBase : `${sparkBase}${subpath}`
}

/** 미들웨어 rewrite: 공개 URL → app/www|spark|show 내부 경로 */
export function resolveInternalPathname(pathname: string, host: string): string {
  if (isInfoSubdomainHost(host)) {
    if (pathname === '/') return '/www/info'
    return `/www/info${pathname}`
  }

  if (isBoardSubdomainHost(host)) {
    if (pathname === '/') return '/www/board'
    if (isPathBoardRoute(pathname)) return `/www${pathname}`
    return `/www/board${pathname}`
  }

  if (isAdminSubdomainHost(host)) {
    if (pathname === '/') return '/www/admin'
    if (isPathAdminRoute(pathname)) return `/www${pathname}`
    return `/www/admin${pathname}`
  }

  if (isShowSubdomainHost(host)) {
    if (pathname === '/') return '/show'
    return `/show${pathname}`
  }

  if (isSparkSubdomainHost(host)) {
    if (pathname === '/') return '/spark'
    return `/spark${pathname}`
  }

  if (isPathShowRoute(pathname)) {
    return pathname
  }

  if (isPathSparkRoute(pathname)) {
    return pathname
  }

  if (isPathInfoRoute(pathname)) {
    return `/www${pathname}`
  }

  if (isPathBoardRoute(pathname)) {
    return `/www${pathname}`
  }

  if (isPathAdminRoute(pathname)) {
    return `/www${pathname}`
  }

  if (isWwwOnlyPath(pathname)) {
    return `/www${pathname}`
  }

  if (pathname === '/') return '/spark'
  return `/www${pathname}`
}

/** www → Spark 메인 리다이렉트가 필요한지 */
export function shouldRedirectToSparkMain(
  pathname: string,
  host: string,
): boolean {
  if (!isWwwHost(host)) return false
  if (isWwwOnlyPath(pathname)) return false
  if (isPathInfoRoute(pathname)) return false
  if (isPathBoardRoute(pathname)) return false
  if (isPathAdminRoute(pathname)) return false
  if (isPathShowRoute(pathname)) return false
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return false
  }
  if (
    pathname.startsWith('/onboarding') ||
    isUserSettingsPath(pathname) ||
    pathname.startsWith('/api/')
  ) {
    return false
  }

  if (isPathBasedNavigationHost(host)) {
    return pathname === '/'
  }

  return pathname === '/' || isPathSparkRoute(pathname)
}

/** 현재 요청 기준 Spark URL (목록·등록·상세) */
export function resolveSparkPath(subpath = '', host = '') {
  const path = subpath
    ? subpath.startsWith('/')
      ? subpath
      : `/${subpath}`
    : ''

  if (host && isSparkSubdomainHost(host)) {
    return path || '/'
  }

  if (isPathBasedNavigationHost(host)) {
    if (!path) return '/spark'
    return `/spark${path}`
  }

  const base = (
    process.env.NEXT_PUBLIC_SPARK_URL ?? 'https://spark.idosquare.co.kr'
  ).replace(/\/$/, '')
  return `${base}${path}`
}

/** 게시판 공개 경로 (board 서브도메인에서는 /board 접두어 없음) */
export function resolveBoardPath(subpath = '', host = '') {
  const raw = subpath
    ? subpath.startsWith('/')
      ? subpath
      : `/${subpath}`
    : ''
  const tail = raw ? boardPathTail(raw.startsWith('/board') ? raw : `/board${raw}`) : '/'

  if (host && isBoardSubdomainHost(host)) {
    return tail === '/' ? '/' : tail
  }

  if (isPathBasedNavigationHost(host)) {
    if (tail === '/') return '/board'
    return `/board${tail}`
  }

  const base = boardPublicBase()
  return tail === '/' ? base : `${base}${tail}`
}

/** Admin 공개 경로 (admin 서브도메인에서는 /admin 접두어 없음) */
export function resolveAdminPath(subpath = '', host = '') {
  const raw = subpath
    ? subpath.startsWith('/')
      ? subpath
      : `/${subpath}`
    : ''
  const tail = raw ? adminPathTail(raw.startsWith('/admin') ? raw : `/admin${raw}`) : '/'

  if (host && isAdminSubdomainHost(host)) {
    return tail === '/' ? '/' : tail
  }

  if (isPathBasedNavigationHost(host)) {
    if (tail === '/') return '/admin'
    return `/admin${tail}`
  }

  const base = adminPublicBase()
  return tail === '/' ? base : `${base}${tail}`
}

/** www ↔ spark ↔ show ↔ info 네비게이션용 */
export function getAppUrl(
  subdomain: 'www' | 'spark' | 'show' | 'info',
  host = '',
) {
  const www = (process.env.NEXT_PUBLIC_WWW_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  )
  const spark = (
    process.env.NEXT_PUBLIC_SPARK_URL ?? 'http://spark.localhost:3000'
  ).replace(/\/$/, '')
  const show = (
    process.env.NEXT_PUBLIC_SHOW_URL ?? 'http://show.localhost:3000'
  ).replace(/\/$/, '')
  const info = infoPublicBase()

  if (isPathBasedNavigationHost(host)) {
    if (subdomain === 'info') return '/info'
    if (subdomain === 'show') return '/show'
    if (subdomain === 'spark') return '/spark'
    return '/'
  }

  if (subdomain === 'info') {
    if (host && isInfoSubdomainHost(host)) return '/'
    return info
  }

  if (subdomain === 'show') {
    if (host && isShowSubdomainHost(host)) return '/'
    return show
  }

  if (subdomain === 'spark') {
    if (host && isSparkSubdomainHost(host)) return '/'
    return spark
  }

  if (
    host &&
    (isSparkSubdomainHost(host) ||
      isShowSubdomainHost(host) ||
      isInfoSubdomainHost(host) ||
      isBoardSubdomainHost(host) ||
      isAdminSubdomainHost(host))
  ) {
    return www
  }
  return www
}

export function resolveShowPath(subpath = '', host = '') {
  const path = subpath
    ? subpath.startsWith('/')
      ? subpath
      : `/${subpath}`
    : ''

  if (host && isShowSubdomainHost(host)) {
    return path || '/'
  }

  if (isPathBasedNavigationHost(host)) {
    if (!path) return '/show'
    return `/show${path}`
  }

  const base = (
    process.env.NEXT_PUBLIC_SHOW_URL ?? 'https://show.idosquare.co.kr'
  ).replace(/\/$/, '')
  return `${base}${path}`
}

/** 회사 소개 — info.idosquare.co.kr */
export function getInfoUrl(host = '') {
  if (isPathBasedNavigationHost(host)) return '/info'
  if (host && isInfoSubdomainHost(host)) return '/'
  return infoPublicBase()
}

/** 게시판 — board.idosquare.co.kr */
export function getBoardUrl(host = '') {
  if (isPathBasedNavigationHost(host)) return '/board'
  if (host && isBoardSubdomainHost(host)) return '/'
  return boardPublicBase()
}

/** 관리자 — admin.idosquare.co.kr */
export function getAdminUrl(host = '') {
  if (isPathBasedNavigationHost(host)) return '/admin'
  if (host && isAdminSubdomainHost(host)) return '/'
  return adminPublicBase()
}
