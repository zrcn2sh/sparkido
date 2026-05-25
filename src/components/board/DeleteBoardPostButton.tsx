'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useBoardPathBuilder } from '@/hooks/use-board-path'
import type { BoardCategory } from '@/types'

type DeleteBoardPostButtonProps = {
  postId: string
  category: BoardCategory
}

export function DeleteBoardPostButton({
  postId,
  category,
}: DeleteBoardPostButtonProps) {
  const router = useRouter()
  const boardPath = useBoardPathBuilder()
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    if (!confirm('이 게시글을 삭제할까요?')) return

    setPending(true)
    try {
      const res = await fetch(`/api/board/${postId}`, { method: 'DELETE' })
      const text = await res.text()
      let data: { error?: string } = {}
      if (text) {
        data = JSON.parse(text) as { error?: string }
      }

      if (!res.ok) {
        alert(data.error ?? '삭제에 실패했습니다.')
        return
      }

      router.push(boardPath(`/${category}`))
      router.refresh()
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={handleDelete}
      className="text-destructive hover:text-destructive"
    >
      {pending ? '삭제 중…' : '삭제'}
    </Button>
  )
}
