import { Reveal } from '@/components/reveal'
import { SectionLabel } from '@/components/section-label'

const stats = ['TypeScript native', 'Zero config', 'Edge-ready', '12KB gzipped']

type Token = { text: string; cls?: string }

const codeLines: Token[][] = [
  [
    { text: 'import', cls: 'text-accent-cyan' },
    { text: ' { ' },
    { text: 'Aegis', cls: 'text-foreground' },
    { text: ' } ' },
    { text: 'from', cls: 'text-accent-cyan' },
    { text: " '@aegis/sdk'", cls: 'text-primary' },
    { text: ';' },
  ],
  [],
  [
    { text: 'const', cls: 'text-accent-cyan' },
    { text: ' aegis = ' },
    { text: 'new', cls: 'text-accent-cyan' },
    { text: ' Aegis', cls: 'text-foreground' },
    { text: '({ apiKey: ' },
    { text: "'your-key'", cls: 'text-primary' },
    { text: ' });' },
  ],
  [],
  [
    { text: 'const', cls: 'text-accent-cyan' },
    { text: ' result = ' },
    { text: 'await', cls: 'text-accent-cyan' },
    { text: ' aegis.buildAndDeploy({' },
  ],
  [
    { text: '  prompt: ' },
    { text: '"Create an ERC-20 token with burn function"', cls: 'text-primary' },
    { text: ',' },
  ],
  [
    { text: '  constructorArgs: { name: ' },
    { text: '"MyToken"', cls: 'text-primary' },
    { text: ', symbol: ' },
    { text: '"MTK"', cls: 'text-primary' },
    { text: ', supply: ' },
    { text: '1000000', cls: 'text-accent-cyan' },
    { text: ' }' },
  ],
  [{ text: '});' }],
  [],
  [
    { text: 'console', cls: 'text-foreground' },
    { text: '.log(result.payload); ' },
    { text: '// Unsigned transaction payload', cls: 'text-muted-foreground' },
  ],
]

export function ForDevelopers() {
  return (
    <section
      id="developers"
      className="relative border-t border-border bg-card/30 px-4 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <SectionLabel>For Developers</SectionLabel>
          <h2 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            One SDK. Build, audit, and deploy from your own code.
          </h2>
          <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Drop Aegis into any AI agent or backend. Generate a fully audited
            contract and get an unsigned payload back — ready for your wallet to
            sign.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5">
            {stats.map((s) => (
              <div key={s} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                <dt className="text-sm text-foreground">{s}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                <span className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                <span className="h-3 w-3 rounded-full bg-accent-cyan/60" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                build-and-deploy.ts
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6">
              <code>
                {codeLines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="mr-4 w-5 shrink-0 select-none text-right text-muted-foreground/40">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">
                      {line.length === 0
                        ? '\u00A0'
                        : line.map((tok, j) => (
                            <span key={j} className={tok.cls}>
                              {tok.text}
                            </span>
                          ))}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
