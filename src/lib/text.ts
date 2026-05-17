/** 저장 전 한글 등 UTF-8 텍스트 검증 */
export function assertValidUtf8Text(value: string, fieldLabel: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed

  if (trimmed.includes('\uFFFD')) {
    throw new Error(`${fieldLabel} 인코딩이 올바르지 않습니다. 다시 입력해 주세요.`)
  }

  // 예전 Windows 스크립트 오류로 DB에 들어간 패턴
  if (/\?{3,}/.test(trimmed)) {
    throw new Error(
      `${fieldLabel}에 깨진 문자가 있습니다. 글을 다시 등록해 주세요.`,
    )
  }

  return trimmed
}
