'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type BoardCommentFormProps = {
  postId: string
}

export function BoardCommentForm({ postId }: BoardCommentFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    try {
      const res = await fetch(`/api/board/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? '댓글 등록에 실패했습니다.')
        return
      }
      setContent('')
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="comment-content">댓글</Label>
        <Textarea
          id="comment-content"
          name="content"
          required
          rows={3}
          maxLength={2000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? '등록 중…' : '댓글 등록'}
      </Button>
    </form>
  )
}
