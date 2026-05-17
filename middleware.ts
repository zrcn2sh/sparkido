import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

function rewritePath(prefix: 'www' | 'spark', pathname: string) {
  if (pathname === '/') return `/${prefix}`
  return `/${prefix}${pathname}`
}

const isAuthPage = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
const isSparkWritePage = createRouteMatcher(['/new'])

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (isAuthPage(req)) {
    return NextResponse.next()
  }

  if (host.startsWith('spark.') && isSparkWritePage(req)) {
    await auth.protect()
  }

  const url = req.nextUrl.clone()
  if (host.startsWith('spark.')) {
    url.pathname = rewritePath('spark', pathname)
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
