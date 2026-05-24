import { getKstYmd, getShowRemainingDaysInMonthKst } from '@/lib/datetime'

/**
 * 미사용 일수 환불액 (정책: 1일 단가 × 미사용 일수).
 * - 등록일·제거일 모두 KST, 당일 포함
 * - usedDays: 등록일부터 제거일까지 경과 일수(양 끝 포함)
 */
export function calcShowUnusedDaysRefund(params: {
  dailyFuel: number
  remainingDaysAtRegister: number
  registeredAtKst: Date
  removedAtKst?: Date
}): { usedDays: number; unusedDays: number; refundAmount: number } {
  const daily = Math.max(0, Math.floor(params.dailyFuel))
  const booked = Math.max(1, Math.floor(params.remainingDaysAtRegister))

  const reg = getKstYmd(params.registeredAtKst)
  const end = params.removedAtKst ?? new Date()
  const rem = getKstYmd(end)

  const regKey = reg.year * 10000 + reg.month * 100 + reg.day
  const remKey = rem.year * 10000 + rem.month * 100 + rem.day

  let usedDays = 1
  if (remKey >= regKey) {
    const regDate = new Date(reg.year, reg.month - 1, reg.day)
    const remDate = new Date(rem.year, rem.month - 1, rem.day)
    usedDays =
      Math.floor(
        (remDate.getTime() - regDate.getTime()) / (24 * 60 * 60 * 1000),
      ) + 1
  }

  usedDays = Math.min(usedDays, booked)
  const unusedDays = Math.max(0, booked - usedDays)
  const refundAmount = daily * unusedDays

  return { usedDays, unusedDays, refundAmount }
}

/** 등록 시점 잔여일 스냅샷 검증용 */
export function snapshotRemainingDaysAtRegister(at: Date = new Date()): number {
  return getShowRemainingDaysInMonthKst(at)
}
