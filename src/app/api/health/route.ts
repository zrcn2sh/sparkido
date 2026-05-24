export const runtime = 'edge'

import { nowKstIso } from '@/lib/datetime'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      service: 'ido',
      timestamp: nowKstIso(),
    })
  } catch (error) {
    console.error('[GET /api/health]', error)
    return NextResponse.json(
      { ok: false, error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
