import { assertValidUtf8Text } from '@/lib/text'

const MAX_SOURCE_URL_LENGTH = 500

export const LAB_SOURCE_URL_SCHEME_MESSAGE =
  '링크는 http:// 또는 https://로 시작해야 합니다.'

function assertLabSourceUrlScheme(trimmed: string): void {
  const lower = trimmed.toLowerCase()
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    throw new Error(LAB_SOURCE_URL_SCHEME_MESSAGE)
  }
}

/** 클라이언트 폼 검증용 — 오류 메시지 또는 null(유효·비어 있음) */
export function getLabSourceUrlValidationError(
  raw: string | undefined | null,
): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  try {
    parseLabSourceUrl(trimmed)
    return null
  } catch (err) {
    return err instanceof Error ? err.message : '링크 형식이 올바르지 않습니다.'
  }
}

export function parseLabSourceUrl(raw: string | undefined | null): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  assertLabSourceUrlScheme(trimmed)

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new Error('참고 링크 URL 형식이 올바르지 않습니다.')
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(LAB_SOURCE_URL_SCHEME_MESSAGE)
  }

  const normalized = url.toString()
  if (normalized.length > MAX_SOURCE_URL_LENGTH) {
    throw new Error(`참고 링크는 ${MAX_SOURCE_URL_LENGTH}자 이내로 입력해 주세요.`)
  }

  return assertValidUtf8Text(normalized, '참고 링크')
}

export function isGithubHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return host === 'github.com' || host === 'www.github.com'
}

/** 타임라인·목록용 짧은 라벨 */
export function formatLabSourceLinkLabel(url: string): string {
  try {
    const u = new URL(url)
    if (isGithubHost(u.hostname)) {
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts.length >= 2) {
        const [owner, repo, kind, ref] = parts
        if (kind === 'commit' && ref) {
          return `${owner}/${repo} · ${ref.slice(0, 7)}`
        }
        if (kind === 'pull' && ref) {
          return `${owner}/${repo} · PR #${ref}`
        }
        if (kind === 'tree' && ref) {
          return `${owner}/${repo} · ${ref}`
        }
        if (kind === 'blob' && ref) {
          return `${owner}/${repo} · ${ref}`
        }
        return `${owner}/${repo}`
      }
    }
    const path = u.pathname === '/' ? '' : u.pathname
    return `${u.hostname}${path}`
  } catch {
    return url
  }
}
