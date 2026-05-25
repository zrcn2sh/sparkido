const FENCED_CODE = /```[\s\S]*?```/g

function singleNewlinesToHardBreaks(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/(?<!\n)\n(?!\n)/g, '  \n')
}

/**
 * Lab 등 평문 줄바꿈을 마크다운 hard break로 변환 (``` 코드 블록 내부는 제외).
 */
export function preserveUserLineBreaksForMarkdown(source: string): string {
  const parts: string[] = []
  let last = 0
  for (const match of source.matchAll(FENCED_CODE)) {
    const index = match.index ?? 0
    parts.push(singleNewlinesToHardBreaks(source.slice(last, index)))
    parts.push(match[0])
    last = index + match[0].length
  }
  parts.push(singleNewlinesToHardBreaks(source.slice(last)))
  return parts.join('')
}
