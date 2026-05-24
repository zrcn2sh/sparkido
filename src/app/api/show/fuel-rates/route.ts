import { getShowPublicConfig } from '@/lib/show-fuel'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Show 타일 Fuel·등록 크기 한도 (공개 읽기) */
export async function GET() {
  try {
    const config = await getShowPublicConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('[show/fuel-rates]', e)
    return NextResponse.json(
      { error: 'Show 설정을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }
}
