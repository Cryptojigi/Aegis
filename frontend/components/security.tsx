import { Lock, RefreshCw, ShieldAlert, ScrollText } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { SectionLabel } from '@/components/section-label'

const items = [
  {
    icon: Lock,
    title: 'No Private Keys Stored',
    body: 'We never store, transmit, or access your private keys. You sign transactions locally in your own wallet.',
  },
  {
    icon: RefreshCw,
    title: 'Idempotent Payments',
    body: 'Every paid endpoint uses idempotency keys — you\u2019ll never be double-charged.',
  },
  {
    icon: ShieldAlert,
    title: 'Hybrid Guardrail',
    body: 'Every input is scanned with both AI and deterministic regex rules to block prompt injections.',
  },
  {
    icon: ScrollText,
    title: 'Audit Transparency',
    body: 'Every security audit returns a structured JSON report with clear vulnerability severity levels.',
  },
]

export function Security() {
  return (
    <section id="security" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionLabel>Security</SectionLabel>
          <h2 className="mt-6 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Security is the default, not an add-on.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 80}
              className="flex gap-5 rounded-2xl border border-border bg-card p-7 transition-colors hover:border-accent-cyan/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-accent-cyan">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
