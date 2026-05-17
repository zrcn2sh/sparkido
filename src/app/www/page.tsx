import Link from 'next/link'
import { HeroIllustration } from '@/components/www/HeroIllustration'
import { BrandStorySection } from '@/components/www/BrandStorySection'
import { VisionSection } from '@/components/www/VisionSection'
import { SloganSection } from '@/components/www/SloganSection'
import { Button } from '@/components/ui/button'
import { getAppUrl } from '@/lib/utils'

export default function WwwHomePage() {
  const sparkUrl = getAppUrl('spark')

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
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
            1인 개발자를 위한 아이디어(Spark) 등록과 실행 기록(Lab) 커뮤니티
            플랫폼입니다.
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
