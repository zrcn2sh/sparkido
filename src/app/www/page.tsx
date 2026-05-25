import { redirect } from 'next/navigation'
import { getRequestHost } from '@/lib/request-host'
import { buildSparkRedirectUrl } from '@/lib/routes'

/** www 루트 — Spark 메인으로 이동 (미들웨어와 동일) */
export default async function WwwRootRedirectPage() {
  const host = await getRequestHost()
  redirect(buildSparkRedirectUrl('/', host))
}
