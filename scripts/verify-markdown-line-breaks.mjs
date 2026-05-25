/**
 * node scripts/verify-markdown-line-breaks.mjs
 */

function singleNewlinesToHardBreaks(text) {
  return text.replace(/\r\n/g, '\n').replace(/(?<!\n)\n(?!\n)/g, '  \n')
}

function preserveUserLineBreaksForMarkdown(source) {
  const FENCED_CODE = /```[\s\S]*?```/g
  const parts = []
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

const a = preserveUserLineBreaksForMarkdown('줄1\n줄2')
if (a !== '줄1  \n줄2') throw new Error(`single break: ${JSON.stringify(a)}`)

const b = preserveUserLineBreaksForMarkdown('```\na\nb\n```')
if (b !== '```\na\nb\n```') throw new Error(`fence: ${JSON.stringify(b)}`)

console.log('OK: markdown line breaks')
