import { redirect } from 'next/navigation'
import { getRequestHost } from '@/lib/request-host'
import { buildSparkRedirectUrl } from '@/lib/routes'

/** 앱 루트 — Spark 메인으로 이동 */
export default async function RootPage() {
  const host = await getRequestHost()
  redirect(buildSparkRedirectUrl('/', host))
}
