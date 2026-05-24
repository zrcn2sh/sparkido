import { redirect } from 'next/navigation'
import { buildSparkRedirectUrl } from '@/lib/routes'
import { headers } from 'next/headers'

/** 앱 루트 — Spark 메인으로 이동 */
export default function RootPage() {
  const host = headers().get('host') ?? ''
  redirect(buildSparkRedirectUrl('/', host))
}
