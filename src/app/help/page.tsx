import Link from 'next/link'
import { Smartphone } from 'lucide-react'
import { AppIconImage } from '@/components/idoweb/AppIconImage'
import { IdoWebShell } from '@/components/idoweb/IdoWebShell'
import { IDOWEB_APPS } from '@/content/idoweb-apps'
import { getRequestHost } from '@/lib/request-host'
import { getLinkUrl, resolveHelpPath } from '@/lib/routes'

export const dynamic = 'force-dynamic'

export default async function HelpHubPage() {
  const host = await getRequestHost()
  const linkHref = getLinkUrl(host)

  return (
    <IdoWebShell variant="center">
      <main className="w-full max-w-[420px] rounded-[18px] border border-white/[0.14] bg-white/[0.06] px-[18px] py-6 backdrop-blur-sm">
        <h1 className="text-center text-[1.4rem] font-bold text-slate-50">
          IdoSquare 도움말
        </h1>
        <p className="mb-5 mt-2.5 text-center text-[0.92rem] leading-relaxed text-slate-300">
          서비스별 도움말 페이지로 이동하세요.
        </p>
        <nav className="grid gap-2.5" aria-label="도움말 목록">
          <Link
            href={linkHref}
            className="flex min-h-[52px] items-center gap-3 rounded-xl border border-blue-300/25 bg-slate-900/50 px-3.5 py-2 text-[0.95rem] font-semibold text-slate-50 transition-opacity hover:opacity-90"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-white/10"
              aria-hidden
            >
              <Smartphone className="size-5 text-slate-300" />
            </span>
            <span className="min-w-0 flex-1">IdoSquare 앱 소개·다운로드</span>
          </Link>
          {IDOWEB_APPS.map((app) => (
            <Link
              key={app.helpSlug}
              href={resolveHelpPath(`/${app.helpSlug}`, host)}
              className="flex min-h-[52px] items-center gap-3 rounded-xl border border-white/[0.14] bg-slate-900/50 px-3.5 py-2 text-[0.95rem] font-semibold text-slate-50 transition-opacity hover:opacity-90"
            >
              <AppIconImage src={app.iconUrl} size="sm" />
              <span className="min-w-0 flex-1">{app.name} 도움말</span>
            </Link>
          ))}
        </nav>
      </main>
    </IdoWebShell>
  )
}
