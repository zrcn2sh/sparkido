export type SparkMode = 'solo' | 'open'

export type SparkVisibility = 'public' | 'private'

export type SparkStage = 'idea' | 'validate' | 'build' | 'live'

export type LabStatus = 'building' | 'live'

export type FuelEnergyType = '응원하기' | '기술 지원' | '시장성 확인'

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
  voltage: number
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

export type BoardPost = {
  id: string
  authorId: string
  category: BoardCategory
  title: string
  content: string
  createdAt: string
  updatedAt: string
}
