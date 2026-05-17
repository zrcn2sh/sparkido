import type { BoardCategory } from '@/types'

export const BOARD_CATEGORIES: {
  id: BoardCategory
  label: string
  description: string
}[] = [
  {
    id: 'notice',
    label: '공지사항',
    description: 'Idosquare 공지와 업데이트',
  },
  {
    id: 'qna',
    label: 'QnA',
    description: '궁금한 점을 질문하고 답변을 나눠요',
  },
  {
    id: 'free',
    label: '자유게시판',
    description: '자유롭게 이야기해요',
  },
]

const CATEGORY_IDS = new Set(BOARD_CATEGORIES.map((c) => c.id))

export function isBoardCategory(value: string): value is BoardCategory {
  return CATEGORY_IDS.has(value as BoardCategory)
}

export function getBoardCategoryMeta(id: BoardCategory) {
  return BOARD_CATEGORIES.find((c) => c.id === id)!
}

export const DEFAULT_BOARD_CATEGORY: BoardCategory = 'notice'
