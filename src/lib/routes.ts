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

export function isPathShowRoute(pathname: string) {
  return pathname === '/show' || pathname.startsWith('/show/')
}

export function isPathInfoRoute(pathname: string) {
  return pathname === '/info' || pathname.startsWith('/info/')
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
  if (!www || !spark || !show || !info) return null

  if (isPathInfoRoute(pathname) && !isInfoSubdomainHost(host)) {
    const tail = pathname === '/info' ? '' : pathname.slice('/info'.length)
    return `${info}${tail || '/'}`
  }

  if (
    isWwwOnlyPath(pathname) &&
    (isSparkSubdomainHost(host) || isShowSubdomainHost(host))
  ) {
    return `${www}${pathname}`
  }

  if (isPathShowRoute(pathname) && isWwwHost(host)) {
    const tail = pathname === '/show' ? '' : pathname.slice('/show'.length)
    return `${show}${tail || '/'}`
  }

  if (isPathSparkRoute(pathname) && isShowSubdomainHost(host)) {
    const tail = pathname.slice('/spark'.length) || '/'
    return `${spark}${tail}`
  }

  if (isPathShowRoute(pathname) && isSparkSubdomainHost(host)) {
    const tail = pathname === '/show' ? '' : pathname.slice('/show'.length)
    return `${show}${tail || '/'}`
  }

  return null
}

/** www 호스트(로컬 localhost 포함, spark·show·info 서브도메인 제외) */
export function isWwwHost(host: string) {
  if (!host) return !isLocalEnv()
  if (isSparkSubdomainHost(host)) return false
  if (isShowSubdomainHost(host)) return false
  if (isInfoSubdomainHost(host)) return false
  return true
}

export function isPathSparkRoute(pathname: string) {
  return pathname === '/spark' || pathname.startsWith('/spark/')
}

export function isWwwInfoPath(pathname: string) {
  return isPathInfoRoute(pathname)
}

export function isWwwBoardPath(pathname: string) {
  return pathname === '/board' || pathname.startsWith('/board/')
}

export function isWwwAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export function isWwwPrivacyPath(pathname: string) {
  return pathname === '/privacy' || pathname.startsWith('/privacy/')
}

/** www 전용 경로: 게시판·관리자·개인정보 (Info는 info 서브도메인) */
export function isWwwOnlyPath(pathname: string) {
  return (
    isWwwBoardPath(pathname) ||
    isWwwAdminPath(pathname) ||
    isWwwPrivacyPath(pathname)
  )
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
  if (isPathShowRoute(pathname)) return false
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return false
  }
  if (
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/settings') ||
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
      isInfoSubdomainHost(host))
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
