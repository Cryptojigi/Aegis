import { Reveal } from '@/components/reveal'
import { SectionLabel } from '@/components/section-label'

const steps = [
  {
    num: '01',
    title: 'Prompt.',
    body: 'Tell Aegis what you want to build. Include your constructor parameters (e.g. token name, supply).',
  },
  {
    num: '02',
    title: 'Generate & Audit.',
    body: 'Aegis writes the contract, runs a structural security audit, and compiles it into ABI + Bytecode — healing any errors automatically.',
  },
  {
    num: '03',
    title: 'Sign & Deploy.',
    body: 'Receive the unsigned payload, sign it with your X Layer wallet, and deploy. Done in under 2 minutes.',
  },
]

export function Process() {
  return (
    <section
      id="process"
      className="relative border-y border-border bg-card/30 px-4 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionLabel>Process</SectionLabel>
          <h2 className="mt-6 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            From idea to deployed contract in three steps.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 100} className="relative">
              <div className="flex items-center gap-4">
                <span className="text-gradient-cyan text-5xl font-semibold tracking-tight">
                  {step.num}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
