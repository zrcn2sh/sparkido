import { ScrollReveal } from '@/components/www/ScrollReveal'

export function SloganSection() {
  return (
    <section
      id="slogan"
      aria-labelledby="slogan-heading"
      className="relative scroll-mt-16"
    >
      <div className="mt-4 border-hairline border-t border-border bg-muted/35 pt-6 md:mt-8 md:pt-10">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary md:text-base">
              Slogan
            </p>

            <div className="mt-10 space-y-10">
              <div>
                <h2
                  id="slogan-heading"
                  className="text-balance text-2xl font-medium leading-snug tracking-tight text-foreground md:text-[1.75rem]"
                >
                  생각을 실행으로,
                  <br />
                  네모난 세상에 새로운 길을 내다.
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-balance text-lg font-medium leading-relaxed tracking-tight text-foreground/90 md:text-xl">
                  Idea to Action, a New Path for a Square World.
                </p>
                <p className="text-balance text-base leading-relaxed text-muted-foreground md:text-lg">
                  We Build What We Imagine.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
