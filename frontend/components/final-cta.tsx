import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { GradientOrbs } from '@/components/gradient-orbs'

export function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden px-4 py-28 sm:px-6 sm:py-36">
      <GradientOrbs />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <h2 className="text-balance text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
            <span className="text-gradient-cyan">
              Ready to build your next smart contract in seconds?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Connect your OKX wallet or grab your free API key to start
            integrating Aegis into your own AI agent.
          </p>
          <div className="mt-10 flex justify-center">
            <a
              href="https://okx.com/agent-store"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-[0_0_40px_-6px_var(--accent-cyan)] transition-all hover:brightness-110"
            >
              Hire on OKX Agent Store
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
