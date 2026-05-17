'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { BoardCategory, BoardPost } from '@/types'

type BoardPostFormProps = {
  mode: 'create' | 'edit'
  category: BoardCategory
  postId?: string
  initial?: Pick<BoardPost, 'title' | 'content'>
}

export function BoardPostForm({
  mode,
  category,
  postId,
  initial,
}: BoardPostFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const payload = {
      category,
      title: String(form.get('title') ?? ''),
      content: String(form.get('content') ?? ''),
    }

    try {
      const url =
        mode === 'create' ? '/api/board' : `/api/board/${postId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      let data: { post?: { id: string }; error?: string } = {}
      const text = await res.text()
      if (text) {
        try {
          data = JSON.parse(text) as { post?: { id: string }; error?: string }
        } catch {
          setError('서버 응답을 처리하지 못했습니다.')
          return
        }
      }

      if (!res.ok) {
        setError(data.error ?? '저장에 실패했습니다.')
        return
      }

      const id = mode === 'create' ? data.post!.id : postId!
      router.push(`/board/${id}`)
      router.refresh()
    } catch (err) {
      console.error('[BoardPostForm]', err)
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">제목 *</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={initial?.title}
          placeholder="게시글 제목"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">내용 *</Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={12}
          defaultValue={initial?.content}
          placeholder="마크다운으로 작성할 수 있습니다."
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          마크다운 문법을 지원합니다. (# 제목, **굵게**, `코드`, 목록 등)
        </p>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? '저장 중…' : mode === 'create' ? '게시글 등록' : '수정 저장'}
      </Button>
    </form>
  )
}
