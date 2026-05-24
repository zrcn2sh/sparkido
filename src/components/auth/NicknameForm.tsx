'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NICKNAME_LIMITS } from '@/lib/nickname'
import { cn } from '@/lib/utils'

type NicknameFormProps = {
  initialNickname?: string
  returnBackUrl: string
  submitLabel?: string
  /** 저장 성공 시 (모달 등) */
  onSuccess?: () => void
  /** true면 router.push 생략 */
  skipRedirect?: boolean
  className?: string
}

export function NicknameForm({
  initialNickname = '',
  returnBackUrl,
  submitLabel = '시작하기',
  onSuccess,
  skipRedirect = false,
  className,
}: NicknameFormProps) {
  const router = useRouter()
  const [nickname, setNickname] = useState(initialNickname)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    try {
      const res = await fetch('/api/users/me/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? '별명 저장에 실패했습니다.')
        return
      }
      sessionStorage.removeItem('nickname-prompt-declined')
      onSuccess?.()
      if (!skipRedirect) {
        router.push(returnBackUrl)
        router.refresh()
      } else {
        router.refresh()
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Label htmlFor="nickname">별명 *</Label>
        <Input
          id="nickname"
          name="nickname"
          required
          autoComplete="nickname"
          minLength={NICKNAME_LIMITS.min}
          maxLength={NICKNAME_LIMITS.max}
          placeholder="화면에 표시될 이름"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? '저장 중…' : submitLabel}
      </Button>
    </form>
  )
}
