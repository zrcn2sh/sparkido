import type { SparkContent } from '@/types'

export function parseSparkContent(raw: string): SparkContent {
  try {
    const parsed = JSON.parse(raw) as SparkContent
    if (parsed.problem && parsed.audience && parsed.solution) {
      return parsed
    }
  } catch {
    /* legacy plain text */
  }
  return {
    problem: raw,
    audience: '',
    solution: '',
  }
}
