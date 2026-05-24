import type { ShowTileCategory, ShowTileKind } from '@/types/show'

export const SHOW_CATEGORY_ORDER: ShowTileCategory[] = [
  'web',
  'app',
  'api_tool',
  'browser_extension',
  'other',
]

export const SHOW_CATEGORY_LABELS: Record<ShowTileCategory, string> = {
  web: '웹',
  app: '앱',
  api_tool: 'API/툴',
  browser_extension: '브라우저확장',
  other: '기타',
}

/** category → DB kind (앱만 app, 나머지 web) */
export function showCategoryToKind(category: ShowTileCategory): ShowTileKind {
  return category === 'app' ? 'app' : 'web'
}
