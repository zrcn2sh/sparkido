import Link from 'next/link'
import { CircleHelp, Clock } from 'lucide-react'
import { AppIconImage } from '@/components/idoweb/AppIconImage'
import {
  APP_STORE_BADGE_URL,
  GOOGLE_PLAY_BADGE_URL,
  type IdoWebApp,
} from '@/content/idoweb-apps'
import { resolveHelpPath } from '@/lib/routes'
import { cn } from '@/lib/utils'

type LinkAppCardProps = {
  app: IdoWebApp
  host: string
}

export function LinkAppCard({ app, host }: LinkAppCardProps) {
  const helpHref = resolveHelpPath(`/${app.helpSlug}`, host)

  return (
    <article className="flex gap-4 rounded-[14px] border border-white/10 bg-white/[0.06] p-[18px_20px] text-left">
      <AppIconImage src={app.iconUrl} size="lg" alt={app.name} />
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold text-white">{app.name}</h2>
        <p className="mt-1 text-sm leading-snug text-slate-300">{app.descriptionKo}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-slate-400">
          {app.descriptionEn}
        </p>
        <div className="mt-3.5 flex w-full flex-nowrap items-stretch gap-1.5">
          {app.appStoreUrl ? (
            <a
              href={app.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 flex-1 items-center justify-center rounded-[10px] bg-white px-2 py-1.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={APP_STORE_BADGE_URL}
                alt="App Store에서 다운로드"
                width={120}
                height={40}
                className="h-auto max-h-10 w-full object-contain"
                decoding="async"
              />
            </a>
          ) : null}
          {app.playStoreUrl ? (
            <a
              href={app.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 flex-1 items-center justify-center rounded-[10px] bg-white px-2 py-1.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={GOOGLE_PLAY_BADGE_URL}
                alt="Google Play에서 다운로드"
                width={120}
                height={40}
                className="h-auto max-h-10 w-full object-contain"
                decoding="async"
              />
            </a>
          ) : app.playStorePending ? (
            <span
              className={cn(
                'inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[10px]',
                'bg-white/15 px-1 py-2.5 text-[11px] font-semibold leading-tight text-slate-400',
              )}
            >
              <Clock className="size-[18px] shrink-0" aria-hidden />
              <span className="text-center">출시예정</span>
            </span>
          ) : null}
          <Link
            href={helpHref}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-[10px] bg-blue-700 px-1 py-2.5 text-[11px] font-semibold text-white"
          >
            <CircleHelp className="size-[18px] shrink-0" aria-hidden />
            <span>도움말</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
