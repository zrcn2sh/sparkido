'use client'

import { useState } from 'react'
import { AdminPanel } from '@/components/admin/admin-layout'
import { AdminLoginHistoryPanel } from '@/components/admin/AdminLoginHistoryPanel'
import { UserRoleBadge } from '@/components/auth/UserRoleBadge'
import { Button } from '@/components/ui/button'
import { getRoleLabel } from '@/lib/role-labels'
import { cn } from '@/lib/utils'
import type { AdminMemberListItem, UserRole } from '@/types'

type AdminMemberTableProps = {
  initialMembers: AdminMemberListItem[]
}

export function AdminMemberTable({ initialMembers }: AdminMemberTableProps) {
  const [members, setMembers] = useState(initialMembers)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [historyTarget, setHistoryTarget] = useState<{
    clerkUserId: string
    nickname: string
  } | null>(null)

  async function handleRoleChange(
    clerkUserId: string,
    role: UserRole,
  ) {
    setError(null)
    setPendingId(clerkUserId)
    const prev = members.find((m) => m.clerkUserId === clerkUserId)
    if (!prev || prev.effectiveRole === role) {
      setPendingId(null)
      return
    }

    setMembers((list) =>
      list.map((m) =>
        m.clerkUserId === clerkUserId
          ? { ...m, role, effectiveRole: role }
          : m,
      ),
    )

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(clerkUserId)}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = (await res.json()) as {
        error?: string
        profile?: { role: UserRole }
        effectiveRole?: UserRole
        roleFromEnv?: boolean
      }
      if (!res.ok) {
        setMembers((list) =>
          list.map((m) =>
            m.clerkUserId === clerkUserId ? prev : m,
          ),
        )
        setError(data.error ?? '등급 변경에 실패했습니다.')
        return
      }

      setMembers((list) =>
        list.map((m) =>
          m.clerkUserId === clerkUserId
            ? {
                ...m,
                role: data.profile?.role ?? role,
                effectiveRole: data.effectiveRole ?? m.effectiveRole,
                roleFromEnv: data.roleFromEnv ?? m.roleFromEnv,
              }
            : m,
        ),
      )
    } catch {
      setMembers((list) =>
        list.map((m) =>
          m.clerkUserId === clerkUserId ? prev : m,
        ),
      )
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setPendingId(null)
    }
  }

  if (members.length === 0) {
    return (
      <AdminPanel>
        <p className="text-sm text-muted-foreground">
          별명을 등록한 회원이 없습니다.
        </p>
      </AdminPanel>
    )
  }

  return (
    <>
      {error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <AdminPanel flush>
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 font-medium">별명</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">현재 권한</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                가입(별명 등록)
              </th>
              <th className="px-4 py-3 font-medium">로그인 이력</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const selectDisabled =
                pendingId === member.clerkUserId || member.roleFromEnv

              return (
                <tr
                  key={member.clerkUserId}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{member.nickname}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                    {member.email ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {member.roleFromEnv ? (
                      <UserRoleBadge role={member.effectiveRole} />
                    ) : (
                      <select
                        aria-label={`${member.nickname} 현재 권한`}
                        className={cn(
                          'h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                        value={member.effectiveRole}
                        disabled={selectDisabled}
                        onChange={(e) =>
                          handleRoleChange(
                            member.clerkUserId,
                            e.target.value as UserRole,
                          )
                        }
                      >
                        <option value="member">
                          {getRoleLabel('member')}
                        </option>
                        <option value="admin">
                          {getRoleLabel('admin')}
                        </option>
                      </select>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {member.createdAt.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setHistoryTarget({
                          clerkUserId: member.clerkUserId,
                          nickname: member.nickname,
                        })
                      }
                    >
                      보기
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </AdminPanel>
      <p className="mt-3 text-xs text-muted-foreground">
        현재 권한은 서비스에 실제 적용되는 등급입니다. 변경 불가 회원은 고정
        표시됩니다. 로그인 이력은 Webhook(D1) 우선, 없으면 Clerk 세션으로
        보완합니다.
      </p>

      {historyTarget && (
        <AdminLoginHistoryPanel
          open
          clerkUserId={historyTarget.clerkUserId}
          nickname={historyTarget.nickname}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </>
  )
}
