import { redirect } from 'next/navigation'
import { getRequestHost } from '@/lib/request-host'
import { resolveAdminPath } from '@/lib/routes'

export default async function AdminIndexPage() {
  const host = await getRequestHost()
  redirect(resolveAdminPath('/members', host))
}
