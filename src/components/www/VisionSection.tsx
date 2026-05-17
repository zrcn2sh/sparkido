import { ScrollReveal } from '@/components/www/ScrollReveal'

const VISION_LINES = [
  '내가 필요해서 시작한 작은 아이디어가, 세상 모두에게 필요한 혁신이 되는 곳.',
  '사각형의 스크린 위에서 창조 정신을 바탕으로 새로운 디지털 길을 열어가는 곳.',
  '생각을 실행으로, 네모난 세상에 새로운 길을 내다.',
] as const

export function VisionSection() {
  return (
    <section
      id="vision"
      aria-labelledby="vision-heading"
      className="relative scroll-mt-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-background via-background/80 to-muted/35"
      />
      <div className="border-hairline border-t border-border bg-muted/35">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p
              id="vision-heading"
              className="text-sm font-medium uppercase tracking-[0.22em] text-primary md:text-base"
            >
              Vision
            </p>

            <div className="mt-10 space-y-6">
              {VISION_LINES.map((line) => (
                <p
                  key={line}
                  className="text-balance text-base leading-relaxed text-foreground/90 md:text-lg"
                >
                  {line}
                </p>
              ))}
              <p className="text-balance pt-2 text-xl font-medium leading-snug tracking-tight text-foreground md:text-2xl">
                우리는 이도스퀘어(idosquare)입니다.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
