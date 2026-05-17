import { assertValidUtf8Text } from '@/lib/text'

export function parseTechStackInput(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((tag) => assertValidUtf8Text(tag, '기술 스택'))
}

export function serializeTechStack(tags: string[]): string | null {
  const cleaned = tags.map((t) => t.trim()).filter(Boolean)
  if (cleaned.length === 0) return null
  return JSON.stringify(cleaned)
}

export function deserializeTechStack(raw: string | null): string[] | null {
  if (!raw?.trim()) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const tags = parsed.map(String).map((t) => t.trim()).filter(Boolean)
    return tags.length > 0 ? tags : null
  } catch {
    return null
  }
}
