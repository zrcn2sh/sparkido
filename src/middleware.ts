import {
  clerkMiddleware,
  createRouteMatcher,
  type ClerkMiddlewareAuth,
} from '@clerk/nextjs/server'
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server'
import {
  getClerkAuthorizedParties,
  withRequestAuthorizedParty,
} from '@/lib/clerk-origins'
import {
  buildSessionAnchorCookieValue,
  getSessionAnchorCookieDomain,
  SESSION_ANCHOR_COOKIE,
} from '@/lib/session-anchor'
import {
  SESSION_EXPIRED_SIGN_IN_REASON,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/session-config'
import { shouldEnforceCustomSessionTimeout } from '@/lib/session-middleware'
import {
  buildApexToWwwRedirect,
  buildCrossSubdomainRedirect,
  buildSparkRedirectUrl,
  isAdminSubdomainHost,
  isAdminSubdomainPublicPath,
  isUserSettingsPath,
  resolveInternalPathname,
  shouldRedirectToSparkMain,
} from '@/lib/routes'
import {
  isSessionExpiredByAnchor,
} from '@/lib/session-timeout'

const LOGIN_EVENT_ENRICH_COOKIE_PREFIX = 'sparkido_le_'
const LOGIN_ENRICH_INTERNAL_PATH = '/api/internal/enrich-login-browser'
const SHOW_PURGE_INTERNAL_PATH = '/api/internal/show/purge-tiles'
const LOGIN_ENRICH_DEV_SECRET = 'dev-local-enrich'

function scheduleLoginBrowserEnrich(
  req: NextRequest,
  sessionId: string,
  event: NextFetchEvent,
) {
  const secret =
    process.env.MIDDLEWARE_ENRICH_SECRET?.trim() || LOGIN_ENRICH_DEV_SECRET
  const url = new URL(LOGIN_ENRICH_INTERNAL_PATH, req.url)
  const task = fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-sparkido-middleware-secret': secret,
      'User-Agent': req.headers.get('user-agent') ?? '',
    },
    body: JSON.stringify({ sessionId }),
  }).catch((err) => {
    console.error('[middleware] login browser enrich', err)
  })
  event.waitUntil(task)
}

function loginEnrichCookieName(sessionId: string): string {
  return `${LOGIN_EVENT_ENRICH_COOKIE_PREFIX}${sessionId}`
}

const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/settings/profile(.*)',
])

const isSessionCheckSkipped = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/settings/profile(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
  '/api/users/me/nickname',
])

/** admin.idosquare.co.kr/settings 는 rewrite 필요 (사용자 /settings/profile 과 분리) */
function shouldBypassRewriteForAuthPage(req: NextRequest): boolean {
  if (!isAuthPage(req)) return false
  const host = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname
  if (
    isAdminSubdomainHost(host) &&
    isAdminSubdomainPublicPath(pathname)
  ) {
    return false
  }
  return true
}

type SessionTimeoutResult = {
  block: NextResponse | null
  setAnchor?: { sessionId: string; anchorUnix: number }
  clearAnchor?: boolean
  /** 로그인 이력 브라우저 1회 보강 */
  markLoginEnriched?: string
}

async function enforceSessionTimeout(
  auth: ClerkMiddlewareAuth,
  req: NextRequest,
  event: NextFetchEvent,
): Promise<SessionTimeoutResult> {
  const authState = await auth()
  if (!authState.userId) {
    return { block: null, clearAnchor: true }
  }

  const sessionId = authState.sessionId
  if (!sessionId) return { block: null }

  const cookieValue = req.cookies.get(SESSION_ANCHOR_COOKIE)?.value

  const { expired, anchorUnix, needsSetCookie } = isSessionExpiredByAnchor(
    sessionId,
    cookieValue,
  )

  if (!expired) {
    const enrichCookie = loginEnrichCookieName(sessionId)
    const shouldEnrichBrowser = !req.cookies.get(enrichCookie)
    if (shouldEnrichBrowser) {
      scheduleLoginBrowserEnrich(req, sessionId, event)
    }

    if (needsSetCookie) {
      return {
        block: null,
        setAnchor: { sessionId, anchorUnix },
        markLoginEnriched: shouldEnrichBrowser ? sessionId : undefined,
      }
    }
    return {
      block: null,
      markLoginEnriched: shouldEnrichBrowser ? sessionId : undefined,
    }
  }

  // Chrome 병렬 요청 race: 한 요청이 revoke하면 다른 탭/요청에서 간헐적 Clerk 403.
  // 미들웨어에서는 리다이렉트만 하고 revoke는 하지 않음.

  const pathname = new URL(req.url).pathname
  const block = pathname.startsWith('/api/')
    ? NextResponse.json(
        { error: '세션이 만료되었습니다. 다시 로그인해 주세요.' },
        { status: 401 },
      )
    : (() => {
        const signIn = new URL('/sign-in', req.url)
        signIn.searchParams.set('reason', SESSION_EXPIRED_SIGN_IN_REASON)
        return NextResponse.redirect(signIn)
      })()

  return { block, clearAnchor: true }
}

function applySessionAnchorCookie(
  res: NextResponse,
  host: string,
  anchor?: { sessionId: string; anchorUnix: number },
  clear?: boolean,
  markLoginEnriched?: string,
) {
  const domain = getSessionAnchorCookieDomain(host)
  const base = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    ...(domain ? { domain } : {}),
  }

  if (clear) {
    res.cookies.delete({
      name: SESSION_ANCHOR_COOKIE,
      path: '/',
      ...(domain ? { domain } : {}),
    })
    return res
  }
  if (anchor) {
    res.cookies.set(SESSION_ANCHOR_COOKIE, buildSessionAnchorCookieValue(anchor.sessionId, anchor.anchorUnix), base)
  }
  if (markLoginEnriched) {
    res.cookies.set(loginEnrichCookieName(markLoginEnriched), '1', base)
  }
  return res
}

const clerkHandler = async (
  auth: ClerkMiddlewareAuth,
  req: NextRequest,
  event: NextFetchEvent,
) => {
  const host = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  if (
    (pathname === LOGIN_ENRICH_INTERNAL_PATH ||
      pathname === SHOW_PURGE_INTERNAL_PATH) &&
    req.method === 'POST'
  ) {
    return NextResponse.next()
  }

  let sessionResult: SessionTimeoutResult = { block: null }

  const runCustomSessionTimeout =
    !isSessionCheckSkipped(req) && shouldEnforceCustomSessionTimeout(req)

  if (runCustomSessionTimeout) {
    sessionResult = await enforceSessionTimeout(auth, req, event)
    if (sessionResult.block) {
      return applySessionAnchorCookie(
        sessionResult.block,
        host,
        undefined,
        sessionResult.clearAnchor,
        sessionResult.markLoginEnriched,
      )
    }
  }

  const apexWww = buildApexToWwwRedirect(
    pathname,
    host,
    req.nextUrl.search,
  )
  if (apexWww) {
    return applySessionAnchorCookie(
      NextResponse.redirect(apexWww),
      host,
      sessionResult.setAnchor,
      sessionResult.clearAnchor,
      sessionResult.markLoginEnriched,
    )
  }

  const crossHost = buildCrossSubdomainRedirect(pathname, host)
  if (crossHost) {
    return applySessionAnchorCookie(
      NextResponse.redirect(crossHost),
      host,
      sessionResult.setAnchor,
      sessionResult.clearAnchor,
      sessionResult.markLoginEnriched,
    )
  }

  let res: NextResponse

  if (pathname.startsWith('/api/')) {
    res = NextResponse.next()
  } else if (shouldBypassRewriteForAuthPage(req)) {
    res = NextResponse.next()
  } else if (shouldRedirectToSparkMain(pathname, host)) {
    const dest = buildSparkRedirectUrl(pathname, host)
    const target = dest.startsWith('http')
      ? dest
      : new URL(dest, req.url).toString()
    res = NextResponse.redirect(target)
  } else {
    const url = req.nextUrl.clone()
    url.pathname = resolveInternalPathname(pathname, host)
    res = NextResponse.rewrite(url)
  }

  const out = applySessionAnchorCookie(
    res,
    host,
    sessionResult.setAnchor,
    sessionResult.clearAnchor,
    sessionResult.markLoginEnriched,
  )
  if (!pathname.startsWith('/api/')) {
    out.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate',
    )
  }
  return out
}

export default clerkMiddleware(clerkHandler, (req) => {
  const host = req.headers.get('host')?.split(':')[0] ?? ''
  const proto =
    req.headers.get('x-forwarded-proto') === 'http' ? 'http' : 'https'
  return {
    authorizedParties: withRequestAuthorizedParty(
      getClerkAuthorizedParties(),
      host,
      proto,
    ),
  }
})

export const config = {
  matcher: [
    '/',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
