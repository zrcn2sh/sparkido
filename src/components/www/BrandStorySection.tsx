import { ScrollReveal } from '@/components/www/ScrollReveal'
import { Separator } from '@/components/ui/separator'

const STORIES = [
  {
    id: '01',
    title: 'I Do, Idea Do : 상상을 행동으로 증명하는 사람들',
    paragraphs: [
      '모든 위대한 혁신은 "내가 직접 만들어보자"는 작은 결심에서 출발합니다.',
      "이도스퀘어는 머릿속에 머물러 있는 아이디어를 실제로 움직여 현실로 만드는 'Idea Do'를 지향합니다. 우리는 관찰하는 사람이 아닙니다. 세상에 필요한 것이 있다면 먼저 행동하고, 직접 만들고, 결과로 증명해 나가는 사람들입니다.",
    ],
  },
  {
    id: '02',
    title: '이도(李祹, 異道, 利道) : 세종의 정신으로, 아무도 가지 않은 이로운 길을 걷습니다',
    paragraphs: [
      "우리의 이름 '이도(ido)'는 세종대왕의 본명 '이도(李祹)'에서 영감을 받았습니다.",
      '백성의 삶을 더 낫게 하기 위해 스스로 과학자가 되어 한글, 측우기, 혼천의를 만들었던 그 정신처럼 — 이도스퀘어는 사람들의 실제 문제를 직접 파고들고, 남들이 가지 않은 길(異道)을 두려움 없이 걸어갑니다.',
      '그 길은 단순히 새롭기만 한 길이 아닙니다. 사람에게 실질적인 도움이 되는, 이로운 길(利道)이어야 한다고 믿습니다.',
      '사이드 프로젝트 하나가 시장의 패러다임을 바꾸는 서비스가 되기까지 — 이도스퀘어가 남기는 모든 발자국은 새롭고(異道), 이롭고(利道), 아무도 먼저 걷지 않은 길입니다.',
    ],
  },
  {
    id: '03',
    title: 'Square : 사람과 가치가 모이는 디지털 광장',
    paragraphs: [
      '우리가 혁신을 펼치는 무대는 스마트폰과 모니터 — 사각형(Square)의 스크린 너머에 있는 디지털 세상입니다.',
      '이도스퀘어가 만드는 서비스는 단순한 소프트웨어가 아닙니다. 사람들이 모여 소통하고, 아이디어를 나누며, 함께 새로운 가치를 만들어가는 온라인 광장입니다. 네모난 스크린 안에서, 세상에서 가장 넓은 광장을 짓습니다.',
    ],
  },
] as const

export function BrandStorySection() {
  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="relative scroll-mt-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-muted/35 via-background/90 to-background"
      />
      <div className="border-hairline border-t border-border bg-background pb-24 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal className="mx-auto max-w-2xl">
            <p className="text-center text-sm font-medium uppercase tracking-[0.22em] text-primary md:text-base">
              Brand Story
            </p>
            <h2
              id="story-heading"
              className="mt-4 text-center text-balance text-xl font-medium leading-snug tracking-tight md:text-2xl"
            >
              브랜드 스토리
            </h2>
            <p className="mt-3 text-center text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
              이도스퀘어(idosquare) : 아이디어가 세상의 광장이 되는 곳
            </p>

            <div className="mt-14 space-y-14">
              {STORIES.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="mb-14 bg-border/60" />}
                  <div className="space-y-4">
                    <p className="text-xs font-medium tracking-wide text-primary">
                      {item.id}
                    </p>
                    <h3 className="text-lg font-medium leading-snug tracking-tight md:text-xl">
                      {item.title}
                    </h3>
                    {item.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 24)}
                        className="text-pretty leading-relaxed text-muted-foreground"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
