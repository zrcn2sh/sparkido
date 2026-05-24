import type { FuelLedgerKind } from '@/lib/fuel-ledger'

export const FUEL_LEDGER_KIND_LABELS: Record<FuelLedgerKind, string> = {
  earn_spark: 'Spark 작성',
  earn_lab: 'Lab 작성',
  earn_cheer: '응원하기',
  earn_login: '로그인',
  earn_signup: '회원가입',
  spend_show_tile: 'Show 타일 등록',
  refund_show_unused: 'Show 게시 취소 환불',
  refund_show_removed: 'Show 제거 환불',
  refund_show_register_failed: 'Show 등록 실패 환불',
  adjust_admin: '관리자 조정',
}

export function fuelLedgerKindLabel(kind: string): string {
  return FUEL_LEDGER_KIND_LABELS[kind as FuelLedgerKind] ?? kind
}
