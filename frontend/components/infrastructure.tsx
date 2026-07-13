import { Reveal } from '@/components/reveal'
import { SectionLabel } from '@/components/section-label'

const stats = [
  { value: '100+', label: 'contracts generated' },
  { value: 'Zero', label: 'private keys stored' },
  { value: '<50ms', label: 'audit response' },
  { value: '24/7', label: 'available' },
]

const locations = [
  'X Layer Mainnet',
  'X Layer Testnet',
  'OKX Wallet',
  'EVM Compatible',
]

export function Infrastructure() {
  return (
    <section className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionLabel>Infrastructure</SectionLabel>
          <h2 className="mt-6 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Built for the OKX Ecosystem
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70} className="bg-card p-8">
              <div className="text-gradient-cyan text-4xl font-semibold tracking-tight sm:text-5xl">
                {stat.value}
              </div>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {locations.map((loc, i) => (
            <Reveal
              key={loc}
              as="span"
              delay={i * 60}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
              {loc}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
