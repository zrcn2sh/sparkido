import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { resolveAdminPath, resolveSparkPath } from '@/lib/routes'
import { getUserRole, isAdmin } from '@/lib/user-role'
import { getRequestHost } from '@/lib/request-host'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { userId } = await auth()
  const host = await getRequestHost()

  if (!userId) {
    redirect(
      `/sign-in?redirect_url=${encodeURIComponent(resolveAdminPath('/', host))}`,
    )
  }

  if (!(await isAdmin(userId))) {
    redirect(resolveSparkPath('/', host))
  }

  const role = await getUserRole(userId)

  return (
    <AdminShell role={role} host={host}>
      {children}
    </AdminShell>
  )
}
