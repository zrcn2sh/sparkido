'use client'

import { useEffect, useState } from 'react'
import {
  SHOW_VISIBLE_PAGE_COUNT,
  SHOW_VISIBLE_PAGE_COUNT_MOBILE,
} from '@/lib/show-carousel'

/** Tailwind `sm` (640px) 이상: 3페이지, 미만: 1페이지 */
const DESKTOP_MEDIA = '(min-width: 640px)'

function readVisiblePageCount(): number {
  if (typeof window === 'undefined') return SHOW_VISIBLE_PAGE_COUNT
  return window.matchMedia(DESKTOP_MEDIA).matches
    ? SHOW_VISIBLE_PAGE_COUNT
    : SHOW_VISIBLE_PAGE_COUNT_MOBILE
}

export function useShowVisiblePageCount(): number {
  const [count, setCount] = useState(readVisiblePageCount)

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
