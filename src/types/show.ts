/** Show 타일 구분 */
export type ShowTileCategory =
  | 'web'
  | 'app'
  | 'api_tool'
  | 'browser_extension'
  | 'other'

/** DB 호환용 — 앱 구분만 kind=app, 나머지는 web */
export type ShowTileKind = 'app' | 'web'

export type ShowTile = {
  id: string
  /** P1·P2 등 여러 페이지에 걸친 타일일 때 동일 값 */
  placementGroupId: string | null
  pageIndex: number
  col: number
  row: number
  width: number
  height: number
  title: string
  tagline: string
  kind: ShowTileKind
  category: ShowTileCategory
  imageUrl: string | null
  iconText: string | null
  linkUrl?: string
  /** @deprecated siteUrl — linkUrl 사용 */
  siteUrl?: string
  /** @deprecated appStoreUrl — linkUrl 사용 */
  appStoreUrl?: string
  sparkId?: string
  sparkTitle?: string
  ownerId: string
  ownerNickname: string
  triedCount: number
  recommendCount: number
  /** 로그인 사용자 기준 (목록 API·서버 렌더) */
  userHasTried?: boolean
  userHasRecommended?: boolean
  createdAt: string
  fuelLedgerId: string | null
  fuelDaily: number | null
  fuelPeriodCharged: number | null
  fuelRemainingDays: number | null
}

export type ShowTileCancelQuote = {
  refundAmount: number
  usedDays: number
  unusedDays: number
  dailyFuel: number
  periodCharged: number
  remainingDaysAtRegister: number
}

export type ShowPage = {
  pageIndex: number
  tiles: ShowTile[]
}
