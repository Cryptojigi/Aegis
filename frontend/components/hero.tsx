import { ArrowRight } from 'lucide-react'
import { ParticleField } from '@/components/particle-field'
import { GradientOrbs } from '@/components/gradient-orbs'

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:pt-36"
    >
      <GradientOrbs />
      <ParticleField className="absolute inset-0 h-full w-full opacity-70" />

      <div className="relative mx-auto max-w-6xl">
        <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          <span className="text-gradient-cyan">
            The Ultimate Builder &amp; Protector Agent for Web3.
          </span>
        </h1>

        <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Generate, self-heal, and audit Solidity contracts with AI—then deploy
          safely to X Layer. Without exposing your private keys.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="https://okx.com/agent-store"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[0_0_30px_-6px_var(--accent-cyan)] transition-all hover:brightness-110"
          >
            Hire on OKX Agent Store
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#developers"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-accent-cyan/50 hover:bg-accent"
          >
            View Docs
          </a>
        </div>
      </div>
    </section>
  )
}
