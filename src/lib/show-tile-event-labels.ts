import type {
  ShowTileEventAction,
  ShowTileEventActorType,
} from '@/lib/show-tile-events'

const ACTION_LABELS: Record<ShowTileEventAction, string> = {
  register: '등록',
  cancel: '게시 취소',
  purge_all: '전체 삭제',
}

const ACTOR_LABELS: Record<ShowTileEventActorType, string> = {
  user: '사용자',
  admin: '관리자',
  cron: '월간 자동',
}

export function showTileEventActionLabel(action: ShowTileEventAction): string {
  return ACTION_LABELS[action] ?? action
}

export function showTileEventActorLabel(
  actorType: ShowTileEventActorType,
): string {
  return ACTOR_LABELS[actorType] ?? actorType
}
