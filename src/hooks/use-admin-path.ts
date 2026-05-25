'use client'

import { useSyncExternalStore } from 'react'
import { resolveAdminPath } from '@/lib/routes'

function getHostSnapshot() {
  return typeof window !== 'undefined' ? window.location.host : ''
}

function subscribeHost() {
  return () => {}
}

/** 클라이언트에서 admin 서브도메인 경로 생성 */
export function useResolveAdminPath(subpath: string) {
  const host = useSyncExternalStore(subscribeHost, getHostSnapshot, () => '')
  return resolveAdminPath(subpath, host)
}
