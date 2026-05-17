import fs from 'node:fs'

const o = '<' + 'motion'.replace('motion', 'div')
const c = '</' + 'motion>'.replace('motion', 'div')

let s = `import { ScrollReveal } from '@/components/www/ScrollReveal'

export function SloganSection() {
  return (
    <section
      id="slogan"
      aria-labelledby="slogan-heading"
      className="relative scroll-mt-16"
    >
      __OD__
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-28 h-28 bg-gradient-to-b from-background via-background/80 to-transparent"
      />
      __OD__ className="border-hairline border-t border-border bg-muted/35">
        __OD__ className="mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary md:text-base">
              Slogan
            </p>

            __OD__ className="mt-10 space-y-10">
              __OD__>
                <h2
                  id="slogan-heading"
                  className="text-balance text-2xl font-medium leading-snug tracking-tight text-foreground md:text-[1.75rem]"
                >
                  생각을 실행으로,
                  <br />
                  네모난 세상에 새로운 길을 내다.
                </h2>
              __CD__

              __OD__ className="space-y-4">
                <p className="text-balance text-lg font-medium leading-relaxed tracking-tight text-foreground/90 md:text-xl">
                  Idea to Action, a New Path for a Square World.
                </p>
                <p className="text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
                  We Build What We Imagine.
                </p>
              __CD__
            __CD__
          </ScrollReveal>
        __CD__
      __CD__
    </section>
  )
}
`

s = s.replaceAll('__OD__', o).replaceAll('__CD__', c)
fs.writeFileSync('src/components/www/SloganSection.tsx', s, 'utf8')
