function isLocalEnv() {
  const www = process.env.NEXT_PUBLIC_WWW_URL ?? ''
  return www.includes('localhost') || www.includes('127.0.0.1')
}

export function isSparkSubdomainHost(host: string) {
  return host.startsWith('spark.')
}

export function isLocalDevHost(host: string) {
  return host.includes('localhost') || host.includes('127.0.0.1')
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

/** www ↔ spark 네비게이션용 */
export function getAppUrl(subdomain: 'www' | 'spark', host = '') {
  const www = (process.env.NEXT_PUBLIC_WWW_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  )
  const spark = (
    process.env.NEXT_PUBLIC_SPARK_URL ?? 'http://spark.localhost:3000'
  ).replace(/\/$/, '')

  const local =
    (host && isLocalDevHost(host)) ||
    (!host && isLocalEnv())

  if (subdomain === 'spark') {
    if (host && isSparkSubdomainHost(host)) return '/'
    if (local) return '/spark'
    return spark
  }

  if (host && isSparkSubdomainHost(host)) return www
  if (local) return '/'
  return www
}
