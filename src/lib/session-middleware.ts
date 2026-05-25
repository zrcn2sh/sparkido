import type { NextRequest } from 'next/server'
import { isPublicBrowsingSubdomainHost } from '@/lib/routes'

/**
 * 커스텀 sparkido_sess_anchor 타임아웃 적용 여부.
 * - info / show / board: 공개 열람 → 미적용 (Clerk만, Chrome 병렬 race 완화)
 * - admin: layout에서 로그인·관리자 필수 → 적용
 * - spark / www / apex: 적용
 */
export function shouldEnforceCustomSessionTimeout(req: NextRequest): boolean {
  const host = req.headers.get('host') || ''
  return !isPublicBrowsingSubdomainHost(host)
}
