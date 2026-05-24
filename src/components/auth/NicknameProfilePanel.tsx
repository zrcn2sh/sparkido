'use client'

import { useEffect, useState } from 'react'
import { NicknameForm } from '@/components/auth/NicknameForm'
import { UserRoleBadge } from '@/components/auth/UserRoleBadge'
import { NICKNAME_LIMITS } from '@/lib/nickname'
import type { UserRole } from '@/types'

type NicknameProfilePanelProps = {
  /** Clerk 계정 관리 모달: 저장 후 이동 없음 */
  mode?: 'modal' | 'page'
  returnBackUrl?: string
  /** page 모드에서 저장 후 returnBackUrl로 이동 (설정 화면은 false) */
  redirectAfterSave?: boolean
}

export function NicknameProfilePanel({
  mode = 'modal',
  returnBackUrl = '/',
  redirectAfterSave = mode === 'page',
}: NicknameProfilePanelProps) {
  const [initialNickname, setInitialNickname] = useState('')
  const [role, setRole] = useState<UserRole>('member')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/users/me/nickname')
        const data = (await res.json()) as {
          profile?: { nickname: string; role?: UserRole } | null
          role?: UserRole
        }
        if (!cancelled) {
          if (data.role) setRole(data.role)
          else if (data.profile?.role) setRole(data.profile.role)
          if (data.profile?.nickname) setInitialNickname(data.profile.nickname)
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">별명 정보를 불러오는 중…</p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">회원 등급</p>
          <p className="mt-0.5 text-sm text-foreground">
            {role === 'admin'
              ? '공지 작성 등 관리 권한이 있습니다.'
              : 'Spark·게시판·댓글 등 일반 회원 권한입니다.'}
          </p>
        </div>
        <UserRoleBadge role={role} />
      </div>
      <p className="text-sm text-muted-foreground">
        Idosquare에서 표시되는 이름입니다. Spark·Lab·게시판 작성자 이름으로
        쓰입니다. ({NICKNAME_LIMITS.min}~{NICKNAME_LIMITS.max}자)
      </p>
      {saved && !redirectAfterSave && (
        <p className="text-sm text-primary" role="status">
          저장되었습니다.
        </p>
      )}
      <NicknameForm
        key={initialNickname}
        initialNickname={initialNickname}
        returnBackUrl={returnBackUrl}
        submitLabel={initialNickname ? '별명 저장' : '별명 등록'}
        onSuccess={!redirectAfterSave ? () => setSaved(true) : undefined}
        skipRedirect={!redirectAfterSave}
      />
    </div>
  )
}
