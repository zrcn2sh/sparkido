'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useId, useState } from 'react'
import { MarkdownBody } from '@/components/markdown/MarkdownBody'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const COLLAPSED_LINES = 3

type SparkNotesCollapsibleProps = {
  content: string
}

function shouldOfferExpand(notes: string): boolean {
  const trimmed = notes.trim()
  if (trimmed.length > 200) return true
  const lines = trimmed.split('\n').filter((line) => line.trim().length > 0)
  return lines.length > COLLAPSED_LINES
}

export function SparkNotesCollapsible({ content }: SparkNotesCollapsibleProps) {
  const bodyId = useId()
  const [expanded, setExpanded] = useState(false)
  const showToggle = shouldOfferExpand(content)

  return (
    <section>
      <h3 className="text-sm text-muted-foreground">더 하고 싶은 말</h3>
      <div
        id={bodyId}
        className={cn('mt-2', !expanded && showToggle && 'line-clamp-3')}
      >
        <MarkdownBody content={content} />
      </div>
      {showToggle && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 -ml-2 h-8 gap-1 px-2 text-xs text-muted-foreground"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={bodyId}
        >
          {expanded ? (
            <>
              접기
              <ChevronUp className="size-3.5" aria-hidden />
            </>
          ) : (
            <>
              더 보기
              <ChevronDown className="size-3.5" aria-hidden />
            </>
          )}
        </Button>
      )}
    </section>
  )
}
