import { earnLoginFuelForClerkSession } from '@/lib/fuel-auth-rewards'
import { enrichLoginEventBrowserFromRequest } from '@/lib/login-event-enrich'
import { NextResponse } from 'next/server'

const DEV_ENRICH_SECRET = 'dev-local-enrich'

/** Edge middleware → Node: 로그인 이벤트 브라우저 보강 (D1) */
export async function POST(req: Request) {
  const secret = req.headers.get('x-sparkido-middleware-secret')
  const expected =
    process.env.MIDDLEWARE_ENRICH_SECRET?.trim() || DEV_ENRICH_SECRET
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let sessionId: string | undefined
  try {
    const body = (await req.json()) as { sessionId?: string }
    sessionId = body.sessionId?.trim()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  }

  try {
    await enrichLoginEventBrowserFromRequest(
      sessionId,
      req.headers.get('user-agent'),
    )
    const fuel = await earnLoginFuelForClerkSession(
      sessionId,
      `mw_${sessionId}`,
    )
    return NextResponse.json({ ok: true, fuel })
  } catch (error) {
    console.error('[POST /api/internal/enrich-login-browser]', error)
    return NextResponse.json(
      { error: 'Enrich failed' },
      { status: 500 },
    )
  }
}
