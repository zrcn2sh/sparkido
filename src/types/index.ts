export type SparkMode = 'solo' | 'open'

export type SparkVisibility = 'public' | 'private'

export type SparkStage = 'idea' | 'build' | 'live'

export type LabStatus = 'building' | 'live'

/** Fuel 획득 — 응원하기만 사용 (기술 지원·시장성 확인은 추후) */
export type FuelEnergyType = '응원하기'

/** 상단 네비 — 사용가능 / 누적 */
export type UserFuelBalance = {
  available: number
  total: number
}

export type SparkContent = {
  problem: string
  audience: string
  solution: string
  notes?: string
}

export type Spark = {
  id: string
  authorId: string
  mode: SparkMode
  visibility: SparkVisibility
  title: string
  content: string
  stage: SparkStage
  fuel: number
  /** fuels 테이블 응원하기 집계 (목록 등) */
  cheerCount: number
  createdAt: string
  updatedAt: string
}

export type Lab = {
  id: string
  sparkId: string
  doerId: string
  status: LabStatus
  parentLabId: string | null
  createdAt: string
}

export type LabLog = {
  id: string
  labId: string
  /** Lab 분기(labs.doer_id) — 비공개 Spark에서도 타인 기록 구분용 */
  doerId: string
  stepNumber: number
  stage: SparkStage
  content: string
  techStack: string[] | null
  sourceUrl: string | null
  promptText: string | null
  /** @deprecated 신규 Lab은 sourceUrl 사용. 기존 데이터만 표시 */
  codeSnippet: string | null
  createdAt: string
}

export type Fuel = {
  id: string
  targetId: string
  targetType: string
  userId: string
  energyType: FuelEnergyType
  createdAt: string
}

export type BoardCategory = 'notice' | 'qna' | 'free'

export type UserRole = 'admin' | 'member'

export type AdminMemberListItem = {
  clerkUserId: string
  nickname: string
  role: UserRole
  effectiveRole: UserRole
  roleFromEnv: boolean
  email: string | null
  createdAt: string
  updatedAt: string
}

export type BoardPost = {
  id: string
  authorId: string
  category: BoardCategory
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export type BoardComment = {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: string
  updatedAt: string
}
