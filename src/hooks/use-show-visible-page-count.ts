'use client'

import { useEffect, useState } from 'react'
import {
  SHOW_VISIBLE_PAGE_COUNT,
  SHOW_VISIBLE_PAGE_COUNT_MOBILE,
} from '@/lib/show-carousel'

/** Tailwind `sm` (640px) 이상: 3페이지, 미만: 1페이지 */
const DESKTOP_MEDIA = '(min-width: 640px)'

export function useShowVisiblePageCount(): number {
  // SSR·hydration 첫 렌더는 항상 데스크톱 기본값(서버와 동일). window는 useEffect에서만 사용.
  const [count, setCount] = useState(SHOW_VISIBLE_PAGE_COUNT)

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA)
    const sync = () => {
      setCount(
        mq.matches ? SHOW_VISIBLE_PAGE_COUNT : SHOW_VISIBLE_PAGE_COUNT_MOBILE,
      )
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return count
}
