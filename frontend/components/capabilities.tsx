import { Wrench, ShieldCheck, FileSearch, KeyRound } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { SectionLabel } from '@/components/section-label'

const capabilities = [
  {
    num: '01',
    icon: Wrench,
    title: 'Self-Healing Compiler',
    body: 'Describe your contract in plain English. Our AI writes Solidity, and if it fails to compile, Aegis automatically fixes the errors—up to 2 retries—until it\u2019s production-ready.',
  },
  {
    num: '02',
    icon: ShieldCheck,
    title: 'Hybrid Guardrail Security',
    body: 'Stop prompt injections and jailbreak attempts. Our hybrid system combines AI reasoning with deterministic regex rules to score every input.',
  },
  {
    num: '03',
    icon: FileSearch,
    title: 'Structured Security Audits',
    body: 'Get clean JSON-format audit reports mapping vulnerabilities (Reentrancy, Front-running, Access Control) with clear severity levels.',
  },
  {
    num: '04',
    icon: KeyRound,
    title: 'Unsafe-by-Design Deployment',
    body: 'We never hold your keys. Aegis generates the unsigned transaction payload — you sign it safely in your own wallet (MetaMask / OKX Wallet).',
  },
]

export function Capabilities() {
  return (
    <section id="capabilities" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionLabel>Capabilities</SectionLabel>
          <h2 className="mt-6 max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Everything you need to build safely on-chain.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2">
          {capabilities.map((cap, i) => (
            <Reveal
              key={cap.num}
              delay={i * 80}
              className="group relative bg-card p-8 transition-colors hover:bg-accent/40 sm:p-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-accent-cyan transition-colors group-hover:border-accent-cyan/50">
                  <cap.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-sm text-muted-foreground/60">
                  {cap.num}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                {cap.title}
              </h3>
              <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                {cap.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
