import {
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_SECTIONS,
} from '@/content/privacy-policy'

export function PrivacyPolicyContent() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-h1:text-2xl prose-h2:mt-10 prose-h2:text-lg prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
      <h1>개인정보 처리방침</h1>
      <p className="lead text-foreground/90">{PRIVACY_POLICY_INTRO}</p>

      {PRIVACY_POLICY_SECTIONS.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          {section.bullets ? (
            <ul>
              {section.bullets.map((item) => (
                <li key={item.slice(0, 32)}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.subsections?.map((sub) => (
            <div key={sub.title}>
              <h3 className="text-base font-semibold text-foreground">
                {sub.title}
              </h3>
              <ul>
                {sub.bullets.map((item) => (
                  <li key={item.slice(0, 32)}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          {section.table ? (
            <div className="not-prose overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {section.table.headers.map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 font-medium text-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/60 last:border-0"
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className="px-3 py-2 align-top text-muted-foreground"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ))}
    </article>
  )
}
