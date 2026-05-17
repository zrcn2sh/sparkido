import { NextResponse } from 'next/server'

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function jsonUnauthorized(message = '로그인이 필요합니다.') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function jsonForbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function isSparkStage(value: unknown): value is import('@/types').SparkStage {
  return (
    value === 'idea' ||
    value === 'validating' ||
    value === 'building' ||
    value === 'launched'
  )
}

export function isSparkMode(value: unknown): value is import('@/types').SparkMode {
  return value === 'solo' || value === 'open'
}
