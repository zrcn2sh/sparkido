import Image from 'next/image'
import Link from 'next/link'
import { IdoWebShell } from '@/components/idoweb/IdoWebShell'
import { LinkAppCard } from '@/components/idoweb/LinkAppCard'
import { IDO_LOGO_URL, IDOWEB_APPS } from '@/content/idoweb-apps'
import { getRequestHost } from '@/lib/request-host'
import { getAppUrl } from '@/lib/routes'

export const dynamic = 'force-dynamic'

export default async function LinkPage() {
  const host = await getRequestHost()
  const wwwHref = getAppUrl('www', host)

  return (
    <IdoWebShell>
      <div className="w-full max-w-[360px] text-center">
        <Image
          src={IDO_LOGO_URL}
          alt="IdoSquare"
          width={80}
          height={80}
          className="mx-auto mb-6 size-20 rounded-[20px] object-cover"
          unoptimized
          priority
        />
        <h1 className="text-2xl font-bold text-white">IdoSquare</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
          바이브 코딩으로 만든 앱을 공유하고 있습니다.
        </p>
        <p className="mt-2 text-sm text-slate-400">
          Sharing apps made with vibe coding.
        </p>
        <p className="mb-4 mt-7 text-left text-sm font-semibold text-slate-400">
          만든 앱
        </p>
        <div className="space-y-3 text-left">
          {IDOWEB_APPS.map((app) => (
            <LinkAppCard key={app.slug} app={app} host={host} />
          ))}
        </div>
        <Link
          href={wwwHref}
          className="mt-7 inline-flex items-center justify-center rounded-[10px] border border-white/15 px-5 py-3 text-[15px] font-semibold text-slate-400 transition-opacity hover:opacity-90"
        >
          www.idosquare.co.kr
        </Link>
      </div>
    </IdoWebShell>
  )
}
