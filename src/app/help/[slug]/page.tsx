import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HelpMarkdown } from '@/components/idoweb/HelpMarkdown'
import { IdoWebShell } from '@/components/idoweb/IdoWebShell'
import { getHelpArticle } from '@/content/help/articles'
import { getIdoWebAppByHelpSlug, HELP_SLUGS } from '@/content/idoweb-apps'
import { getRequestHost } from '@/lib/request-host'
import { resolveHelpPath } from '@/lib/routes'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return HELP_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const article = getHelpArticle(slug)
  if (!article) return { title: '도움말' }
  return { title: article.title }
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getHelpArticle(slug)
  if (!article) notFound()

  const host = await getRequestHost()
  const app = getIdoWebAppByHelpSlug(slug)
  const hubHref = resolveHelpPath('/', host)

  return (
    <IdoWebShell variant="top">
      <article className="w-full max-w-2xl">
        {app ? (
          <div className="mb-6 flex items-center gap-3">
            <Image
              src={app.iconUrl}
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-xl object-cover"
              unoptimized
            />
            <h1 className="text-2xl font-bold text-white">{article.title}</h1>
          </div>
        ) : (
          <h1 className="mb-6 text-2xl font-bold text-white">{article.title}</h1>
        )}
        <HelpMarkdown content={article.markdown} />
        <p className="mt-10 border-t border-white/10 pt-6">
          <Link
            href={hubHref}
            className="text-sm font-semibold text-blue-300 underline-offset-4 hover:underline"
          >
            전체 도움말 목록으로 이동
          </Link>
        </p>
      </article>
    </IdoWebShell>
  )
}
