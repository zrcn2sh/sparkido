import { verifyWebhook } from '@clerk/nextjs/webhooks'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { handleClerkWebhookEvent } from '@/lib/clerk-webhook'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const clerkEventId = request.headers.get('svix-id')
    if (!clerkEventId) {
      return NextResponse.json(
        { error: 'Missing svix-id header' },
        { status: 400 },
      )
    }

    const evt = await verifyWebhook(request)
    const result = await handleClerkWebhookEvent(evt, clerkEventId)

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('[POST /api/webhooks/clerk]', error)
    return NextResponse.json(
      { error: 'Webhook verification or processing failed' },
      { status: 400 },
    )
  }
}
