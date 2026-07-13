import { Reveal } from '@/components/reveal'
import { SectionLabel } from '@/components/section-label'

const integrations = [
  'DeepSeek Coder V2',
  'Solidity',
  'Ethers.js',
  'OKX Web3 SDK',
  'X Layer',
  'Hardhat',
  'Foundry',
  'Node.js',
  'TypeScript',
]

export function Integrations() {
  return (
    <section className="relative border-t border-border bg-card/30 px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionLabel>Integrations</SectionLabel>
          <h2 className="mt-6 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Plugs into the tools you already ship with.
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-wrap gap-3">
          {integrations.map((item, i) => (
            <Reveal
              key={item}
              as="span"
              delay={i * 50}
              className="group inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-accent-cyan/50 hover:text-foreground"
            >
              <span className="h-2 w-2 rounded-sm bg-accent-cyan/60 transition-colors group-hover:bg-accent-cyan" />
              {item}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
