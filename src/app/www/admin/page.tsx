export const runtime = 'edge'

import { redirect } from 'next/navigation'

export default function AdminIndexPage() {
  redirect('/admin/members')
}
