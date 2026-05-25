import {
  clerkMiddleware,
  createRouteMatcher,
  type ClerkMiddlewareAuth,
} from '@clerk/nextjs/server'
import { type NextRequest, NextResponse } from 'next/server'
import {
  buildSessionAnchorCookieValue,
  SESSION_ANCHOR_COOKIE,
} from '@/lib/session-anchor'
import {
  SESSION_EXPIRED_SIGN_IN_REASON,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/session-config'
import {
  buildCrossSubdomainRedirect,
  buildSparkRedirectUrl,
  resolveInternalPathname,
  shouldRedirectToSparkMain,
} from '@/lib/routes'
import {
  isSessionExpiredByAnchor,
  revokeSessionIfPresent,
} from '@/lib/session-timeout'

const LOGIN_EVENT_ENRICH_COOKIE_PREFIX = 'sparkido_le_'
const LOGIN_ENRICH_INTERNAL_PATH = '/api/internal/enrich-login-browser'
const SHOW_PURGE_INTERNAL_PATH = '/api/internal/show/purge-tiles'
const LOGIN_ENRICH_DEV_SECRET = 'dev-local-enrich'

function scheduleLoginBrowserEnrich(req: NextRequest, sessionId: string) {
  const secret =
    process.env.MIDDLEWARE_ENRICH_SECRET?.trim() || LOGIN_ENRICH_DEV_SECRET
  const url = new URL(LOGIN_ENRICH_INTERNAL_PATH, req.url)
  void fetch(url, {
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
}

function loginEnrichCookieName(sessionId: string): string {
  return `${LOGIN_EVENT_ENRICH_COOKIE_PREFIX}${sessionId}`
}

const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/settings(.*)',
])

const isSessionCheckSkipped = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/settings(.*)',
  '/api/webhooks(.*)',
  '/api/health(.*)',
  '/api/users/me/nickname',
])

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
      scheduleLoginBrowserEnrich(req, sessionId)
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

  await revokeSessionIfPresent(sessionId)

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
  anchor?: { sessionId: string; anchorUnix: number },
  clear?: boolean,
  markLoginEnriched?: string,
) {
  if (clear) {
    res.cookies.delete(SESSION_ANCHOR_COOKIE)
    return res
  }
  if (anchor) {
    res.cookies.set(SESSION_ANCHOR_COOKIE, buildSessionAnchorCookieValue(anchor.sessionId, anchor.anchorUnix), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })
  }
  if (markLoginEnriched) {
    res.cookies.set(loginEnrichCookieName(markLoginEnriched), '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })
  }
  return res
}

export default clerkMiddleware(async (auth, req) => {
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

  if (!isSessionCheckSkipped(req)) {
    sessionResult = await enforceSessionTimeout(auth, req)
    if (sessionResult.block) {
      return applySessionAnchorCookie(
        sessionResult.block,
        undefined,
        sessionResult.clearAnchor,
        sessionResult.markLoginEnriched,
      )
    }
  }

  const crossHost = buildCrossSubdomainRedirect(pathname, host)
  if (crossHost) {
    return applySessionAnchorCookie(
      NextResponse.redirect(crossHost),
      sessionResult.setAnchor,
      sessionResult.clearAnchor,
      sessionResult.markLoginEnriched,
    )
  }

  let res: NextResponse

  if (pathname.startsWith('/api/')) {
    res = NextResponse.next()
  } else if (isAuthPage(req)) {
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

  return applySessionAnchorCookie(
    res,
    sessionResult.setAnchor,
    sessionResult.clearAnchor,
    sessionResult.markLoginEnriched,
  )
})

export const config = {
  matcher: [
    '/',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
