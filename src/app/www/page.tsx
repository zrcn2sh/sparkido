import { FlaskConical, Zap } from 'lucide-react'
import Link from 'next/link'
import { HeroIllustration } from '@/components/www/HeroIllustration'
import { BrandStorySection } from '@/components/www/BrandStorySection'
import { VisionSection } from '@/components/www/VisionSection'
import { SloganSection } from '@/components/www/SloganSection'
import { Button } from '@/components/ui/button'
import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { getAppUrl } from '@/lib/routes'
import { cn } from '@/lib/utils'

export default function WwwHomePage() {
  const sparkUrl = getAppUrl('spark')

  return (
    <>
      <section
        className={cn(
          'mx-auto py-10 md:py-14',
          SITE_MAX_WIDTH_CLASS,
          SITE_HORIZONTAL_PADDING_CLASS,
        )}
      >
        <HeroIllustration />

        <div className="mx-auto max-w-2xl text-center md:mx-0 md:text-left">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            Ido = Idea + Do | I Do
          </p>
          <h1 className="mt-4 max-w-xl text-balance">
            아이디어는 누구나 가질 수 있지만,           <br />
            실행의 궤적은 당신만의 것입니다
          </h1>
          <p className="mt-6 max-w-lg text-muted-foreground">
            개발자 및 기획자를 위한 아이디어(
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <Zap className="size-3.5 shrink-0 text-primary" aria-hidden />
              Spark
            </span>
            ) 등록과 실행 기록(
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
              <FlaskConical
                className="size-3.5 shrink-0 text-primary"
                aria-hidden
              />
              Lab
            </span>
            ) 커뮤니티 플랫폼입니다.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 md:justify-start">
            <Button render={<Link href={sparkUrl} />}>Spark 둘러보기</Button>
            <Button variant="outline" render={<Link href="/board" />}>
              게시판
            </Button>
          </div>
        </div>
      </section>

      <SloganSection />
      <BrandStorySection />
      <VisionSection />
    </>
  )
}
