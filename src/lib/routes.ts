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

export function isPathShowRoute(pathname: string) {
  return pathname === '/show' || pathname.startsWith('/show/')
}

export function isLocalDevHost(host: string) {
  return host.includes('localhost') || host.includes('127.0.0.1')
}

/** www 호스트(로컬 localhost 포함, spark·show 서브도메인 제외) */
export function isWwwHost(host: string) {
  if (!host) return !isLocalEnv()
  if (isSparkSubdomainHost(host)) return false
  if (isShowSubdomainHost(host)) return false
  return true
}

export function isPathSparkRoute(pathname: string) {
  return pathname === '/spark' || pathname.startsWith('/spark/')
}

export function isWwwInfoPath(pathname: string) {
  return pathname === '/info' || pathname.startsWith('/info/')
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

/** www 전용 경로: 회사 소개·게시판·관리자·개인정보 */
export function isWwwOnlyPath(pathname: string) {
  return (
    isWwwInfoPath(pathname) ||
    isWwwBoardPath(pathname) ||
    isWwwAdminPath(pathname) ||
    isWwwPrivacyPath(pathname)
  )
}

/**
 * www 루트 또는 /spark/* 접속 시 Spark 메인으로 보낼 URL
 * - 프로덕션 www → spark 서브도메인 절대 URL
 * - 로컬 → 동일 호스트 /spark
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
  const local =
    (host && isLocalDevHost(host)) || (!host && isLocalEnv())

  if (onSparkSubdomain) {
    return subpath
  }

  if (local) {
    return subpath === '/' ? '/spark' : `/spark${subpath}`
  }

  return subpath === '/' ? sparkBase : `${sparkBase}${subpath}`
}

/** 미들웨어 rewrite: 공개 URL → app/www|spark|show 내부 경로 */
export function resolveInternalPathname(pathname: string, host: string): string {
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

  const local =
    (host && isLocalDevHost(host)) || (!host && isLocalEnv())

  // 로컬: /spark 는 경로 prefix — 리다이렉트하면 /spark ↔ /spark 무한 루프
  if (local) {
    return pathname === '/'
  }

  // 프로덕션 www: 루트·/spark/* → spark 서브도메인
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

  if ((host && isLocalDevHost(host)) || (!host && isLocalEnv())) {
    if (!path) return '/spark'
    return `/spark${path}`
  }

  const base = (
    process.env.NEXT_PUBLIC_SPARK_URL ?? 'https://spark.idosquare.co.kr'
  ).replace(/\/$/, '')
  return `${base}${path}`
}

/** www ↔ spark ↔ show 네비게이션용 */
export function getAppUrl(subdomain: 'www' | 'spark' | 'show', host = '') {
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

  const local =
    (host && isLocalDevHost(host)) ||
    (!host && isLocalEnv())

  if (subdomain === 'show') {
    if (host && isShowSubdomainHost(host)) return '/'
    if (local) return '/show'
    return show
  }

  if (subdomain === 'spark') {
    if (host && isSparkSubdomainHost(host)) return '/'
    if (local) return '/spark'
    return spark
  }

  if (host && (isSparkSubdomainHost(host) || isShowSubdomainHost(host))) {
    return www
  }
  if (local) return '/'
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

  if ((host && isLocalDevHost(host)) || (!host && isLocalEnv())) {
    if (!path) return '/show'
    return `/show${path}`
  }

  const base = (
    process.env.NEXT_PUBLIC_SHOW_URL ?? 'https://show.idosquare.co.kr'
  ).replace(/\/$/, '')
  return `${base}${path}`
}

/** 회사 소개(비전·미션) — www.idosquare.co.kr/info */
export function getInfoUrl(host = '') {
  const www = getAppUrl('www', host).replace(/\/$/, '')
  const path = '/info'
  if (!www || www === '/') return path
  return `${www}${path}`
}
