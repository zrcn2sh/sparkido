import { FlaskConical, Zap } from 'lucide-react'
import { HeroIllustration } from '@/components/www/HeroIllustration'
import { BrandStorySection } from '@/components/www/BrandStorySection'
import { VisionSection } from '@/components/www/VisionSection'
import { SloganSection } from '@/components/www/SloganSection'
import { InfoFooter } from '@/components/www/InfoFooter'
import {
  SITE_HORIZONTAL_PADDING_CLASS,
  SITE_MAX_WIDTH_CLASS,
} from '@/lib/layout'
import { cn } from '@/lib/utils'

export default function WwwInfoPage() {
  return (
    <>
      <section
        className={cn(
          'mx-auto py-10 pb-20 md:py-14 md:pb-28',
          SITE_MAX_WIDTH_CLASS,
          SITE_HORIZONTAL_PADDING_CLASS,
        )}
      >
        <HeroIllustration />

        <div className="text-center md:text-left">
          <div className="inline-block max-w-full min-w-0 text-left md:min-w-max md:overflow-x-auto">
          <p className="whitespace-nowrap text-xs font-medium uppercase tracking-widest text-primary">
            Ido = Idea + Do | I Do
          </p>
          <h1 className="mt-4 whitespace-nowrap">
            아이디어는 누구나 가질 수 있지만, 실행의 궤적은 당신만의 것입니다
          </h1>
          <p className="mt-6 whitespace-nowrap text-base leading-relaxed text-foreground">
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
          </div>
        </div>
      </section>

      <SloganSection />
      <BrandStorySection />
      <VisionSection />
      <InfoFooter />
    </>
  )
}
