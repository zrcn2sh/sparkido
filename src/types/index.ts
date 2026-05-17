export type SparkMode = 'solo' | 'open'

export type SparkStage = 'idea' | 'validating' | 'building' | 'launched'

export type LabStatus = 'building' | 'live'

export type LabLogType =
  | '개발'
  | '리서치'
  | '고객 인터뷰'
  | 'AI 프롬프트'
  | '디자인'
  | '피벗'
  | '출시'

export type FuelEnergyType = '응원하기' | '기술 지원' | '시장성 확인'

export type SparkContent = {
  problem: string
  audience: string
  solution: string
  techStack?: string[]
}

export type Spark = {
  id: string
  authorId: string
  mode: SparkMode
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
  type: LabLogType
  content: string
  promptText: string | null
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
