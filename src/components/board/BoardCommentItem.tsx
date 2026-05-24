'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatKstDateTime } from '@/lib/datetime'
import type { BoardComment } from '@/types'

type BoardCommentItemProps = {
  postId: string
  comment: BoardComment
  authorName: string
  canManage: boolean
}

export function BoardCommentItem({
  postId,
  comment,
  authorName,
  canManage,
}: BoardCommentItemProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(comment.content)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleUpdate() {
    setError(null)
    setPending(true)
    try {
      const res = await fetch(
        `/api/board/${postId}/comments/${comment.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        },
      )
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? '수정에 실패했습니다.')
        return
      }
      setEditing(false)
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  async function handleDelete() {
    if (!confirm('이 댓글을 삭제할까요?')) return
    setPending(true)
    try {
      const res = await fetch(
        `/api/board/${postId}/comments/${comment.id}`,
        { method: 'DELETE' },
      )
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        alert(data.error ?? '삭제에 실패했습니다.')
        return
      }
      router.refresh()
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <li className="rounded-lg border-hairline border border-border px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{authorName}</p>
        <time
          dateTime={comment.createdAt}
          className="text-xs tabular-nums text-muted-foreground"
        >
          {formatKstDateTime(comment.createdAt)}
          {comment.updatedAt !== comment.createdAt && ' (수정됨)'}
        </time>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <Textarea
            rows={3}
            maxLength={2000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => void handleUpdate()}
            >
              {pending ? '저장 중…' : '저장'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setEditing(false)
                setContent(comment.content)
                setError(null)
              }}
            >
              취소
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
          {comment.content}
        </p>
      )}

      {canManage && !editing && (
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={() => setEditing(true)}
          >
            수정
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            disabled={pending}
            onClick={() => void handleDelete()}
          >
            삭제
          </Button>
        </div>
      )}
    </li>
  )
}
