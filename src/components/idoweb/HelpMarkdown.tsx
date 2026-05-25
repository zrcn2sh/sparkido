'use client'

import { MarkdownBody } from '@/components/markdown/MarkdownBody'
import { cn } from '@/lib/utils'

type HelpMarkdownProps = {
  content: string
}

/** help.idosquare.co.kr 다크 테마용 마크다운 */
export function HelpMarkdown({ content }: HelpMarkdownProps) {
  return (
    <MarkdownBody
      content={content}
      className={cn(
        'idoweb-help-markdown max-w-none text-[15px] text-slate-200',
        '[&_h2]:text-xl [&_h2]:text-white [&_h3]:text-lg [&_h3]:text-slate-100',
        '[&_strong]:text-slate-100 [&_a]:text-blue-300 [&_a]:underline',
        '[&_hr]:border-white/15 [&_li]:text-slate-300',
      )}
    />
  )
}
