import { getCloudflareContext } from '@opennextjs/cloudflare'
import { nowKstIso } from '@/lib/datetime'
import { NextResponse } from 'next/server'

export async function GET() {
  const body = {
    ok: true,
    service: 'ido',
    timestamp: nowKstIso(),
    clerkPublishableConfigured: Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim(),
    ),
    clerkSecretConfigured: Boolean(process.env.CLERK_SECRET_KEY?.trim()),
    d1Bound: false,
    d1Ok: false,
    error: null as string | null,
  }

  try {
    const { env } = await getCloudflareContext({ async: true })
    body.d1Bound = Boolean(env.DB)
    if (env.DB) {
      await env.DB.prepare('SELECT 1 AS n').first()
      body.d1Ok = true
    } else {
      body.ok = false
      body.error = 'D1 binding "DB" missing'
    }
  } catch (error) {
    body.ok = false
    body.error = error instanceof Error ? error.message : String(error)
    console.error('[GET /api/health]', error)
  }

  if (!body.clerkSecretConfigured) {
    body.ok = false
    body.error ??=
      'CLERK_SECRET_KEY not set (middleware may return 500 on all routes)'
  }

  return NextResponse.json(body, { status: body.ok ? 200 : 500 })
}
