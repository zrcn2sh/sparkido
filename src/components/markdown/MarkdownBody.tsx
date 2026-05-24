'use client'

import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

type MarkdownBodyProps = {
  content: string
  className?: string
  /** 목록 미리보기 — 여백 축소, 링크는 텍스트만 (카드 `<a>` 중첩 방지) */
  compact?: boolean
}

export function MarkdownBody({
  content,
  className,
  compact = false,
}: MarkdownBodyProps) {
  return (
    <div
      className={cn(
        'markdown-body text-sm leading-relaxed text-foreground',
        compact && 'leading-snug',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h2
              className={cn(
                'font-medium first:mt-0',
                compact ? 'mb-1 text-base' : 'mt-6 mb-3 text-xl',
              )}
            >
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3
              className={cn(
                'font-medium first:mt-0',
                compact ? 'mb-1 text-sm' : 'mt-5 mb-2 text-lg',
              )}
            >
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <p
              className={cn(
                'font-medium first:mt-0',
                compact ? 'mb-1' : 'mt-4 mb-2',
              )}
            >
              {children}
            </p>
          ),
          p: ({ children }) => (
            <p className={cn(compact ? 'mb-1 last:mb-0' : 'mb-3 last:mb-0')}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={cn(
                'list-disc space-y-0.5 pl-4',
                compact ? 'mb-1' : 'mb-3',
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={cn(
                'list-decimal space-y-0.5 pl-4',
                compact ? 'mb-1' : 'mb-3',
              )}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) =>
            compact ? (
              <span className="text-primary">{children}</span>
            ) : (
              <a
                href={href}
                className="text-primary underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-primary/40 pl-4 text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClass, children }) => {
            const isBlock = codeClass?.includes('language-')
            if (isBlock) {
              return (
                <code className={cn('font-mono text-xs', codeClass)}>
                  {children}
                </code>
              )
            }
            return (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                {children}
              </code>
            )
          },
          pre: ({ children }) =>
            compact ? (
              <p className="mb-1 font-mono text-xs text-muted-foreground line-clamp-1">
                {children}
              </p>
            ) : (
              <pre className="mb-3 overflow-x-auto rounded-lg border-hairline border border-border bg-muted/50 p-3 font-mono text-xs">
                {children}
              </pre>
            ),
          hr: () => <hr className="my-6 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
