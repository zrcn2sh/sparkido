import { redirect } from 'next/navigation'
import { buildSparkRedirectUrl } from '@/lib/routes'
import { headers } from 'next/headers'

/** www 루트 — Spark 메인으로 이동 (미들웨어와 동일) */
export default function WwwRootRedirectPage() {
  const host = headers().get('host') ?? ''
  redirect(buildSparkRedirectUrl('/', host))
}
