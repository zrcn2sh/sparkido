import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

function rewritePath(prefix: 'www' | 'spark', pathname: string) {
  if (pathname === '/') return `/${prefix}`
  return `/${prefix}${pathname}`
}

const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

function isPathSparkRoute(pathname: string) {
  return pathname === '/spark' || pathname.startsWith('/spark/')
}

export default clerkMiddleware(async (_auth, req) => {
  const host = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (isAuthPage(req)) {
    return NextResponse.next()
  }

  const onSparkSubdomain = host.startsWith('spark.')
  const onSparkPath = isPathSparkRoute(pathname)

  const url = req.nextUrl.clone()
  if (onSparkSubdomain) {
    url.pathname = rewritePath('spark', pathname)
  } else if (onSparkPath) {
    url.pathname = pathname
  } else {
    url.pathname = rewritePath('www', pathname)
  }

  return NextResponse.rewrite(url)
})

export const config = {
  matcher: [
    '/',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
