'use client'

import { useSyncExternalStore } from 'react'
import { resolveBoardPath } from '@/lib/routes'

function getHostSnapshot() {
  return typeof window !== 'undefined' ? window.location.host : ''
}

function subscribeHost() {
  return () => {}
}

/** 클라이언트에서 board 서브도메인 경로 생성 */
export function useResolveBoardPath(subpath: string) {
  const host = useSyncExternalStore(subscribeHost, getHostSnapshot, () => '')
  return resolveBoardPath(subpath, host)
}

export function useBoardPathBuilder() {
  const host = useSyncExternalStore(subscribeHost, getHostSnapshot, () => '')
  return (subpath: string) => resolveBoardPath(subpath, host)
}
