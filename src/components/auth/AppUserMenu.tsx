'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { LogOut, Pencil, Settings } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { UserRoleBadge } from '@/components/auth/UserRoleBadge'
import type { UserRole } from '@/types'
import { cn } from '@/lib/utils'

const menuItemClass =
  'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted'

export function AppUserMenu() {
  const { isLoaded, isSignedIn, user } = useUser()
  const clerk = useClerk()
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<UserRole>('member')
  const rootRef = useRef<HTMLDivElement>(null)
  const repaired = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || repaired.current) return
    repaired.current = true
    fetch('/api/users/me/nickname')
      .then((res) => res.json())
      .then((data: { role?: UserRole }) => {
        if (data.role) setRole(data.role)
        return user.reload()
      })
      .catch(() => {
        repaired.current = false
      })
  }, [isLoaded, isSignedIn, user])

  useEffect(() => {
    if (!open || !isSignedIn) return
    fetch('/api/users/me/nickname')
      .then((res) => res.json())
      .then((data: { role?: UserRole }) => {
        if (data.role) setRole(data.role)
      })
      .catch(() => {})
  }, [open, isSignedIn])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  if (!isLoaded) {
    return <span className="inline-block h-7 w-7 animate-pulse rounded-full bg-muted" />
  }

  if (!isSignedIn || !user) return null

  const displayName =
    user.firstName?.trim() || user.fullName?.trim() || '회원'
  const email = user.primaryEmailAddress?.emailAddress ?? ''

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="rounded-full ring-offset-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.imageUrl}
          alt=""
          className="h-7 w-7 rounded-full object-cover"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[17.5rem] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.imageUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm font-medium">{displayName}</span>
                <UserRoleBadge
                  role={role}
                  className="h-5 shrink-0 rounded-md px-1.5 text-[10px] leading-none"
                />
              </div>
              {email && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </div>

          <div className="p-1">
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => {
                setOpen(false)
                clerk.openUserProfile()
              }}
            >
              <Settings className="size-4 shrink-0 text-muted-foreground" />
              Manage account
            </button>
            <Link
              href="/settings/profile"
              role="menuitem"
              className={menuItemClass}
              onClick={() => setOpen(false)}
            >
              <Pencil className="size-4 shrink-0 text-muted-foreground" />
              별명 관리
            </Link>
            <button
              type="button"
              role="menuitem"
              className={cn(menuItemClass, 'text-foreground')}
              onClick={() => {
                setOpen(false)
                void clerk.signOut({ redirectUrl: '/' })
              }}
            >
              <LogOut className="size-4 shrink-0 text-muted-foreground" />
              Sign out
            </button>
          </div>

          <div className="border-t border-border bg-muted/40 px-4 py-2.5 text-center text-[10px] text-muted-foreground">
            Secured by Clerk
          </div>
        </div>
      )}
    </div>
  )
}
