import Image from 'next/image'

const HERO_WIDTH = 1024
const HERO_HEIGHT = 571

export function HeroIllustration() {
  return (
    <figure className="relative mx-auto mb-12 w-full max-w-4xl md:mb-14">
      <div className="overflow-hidden rounded-lg border-hairline border border-border bg-card shadow-linear">
        <Image
          src="/images/hero-idosquare.webp"
          alt="idosquare — 아이디어에서 실행까지 이어지는 협업과 Spark의 여정"
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
          priority
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 896px"
          className="h-auto w-full object-contain"
        />
      </div>
      <figcaption className="sr-only">
        idosquare 브랜드 일러스트: IDEA, I DO, SPARK, NEW PATH
      </figcaption>
    </figure>
  )
}
