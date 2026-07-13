const partners = [
  'X Layer',
  'OKX Wallet',
  'DeepSeek',
  'Solidity',
  'Ethereum',
  'OpenAI',
]

export function TrustBar() {
  const row = [...partners, ...partners]
  return (
    <section className="relative border-y border-border bg-card/30 py-8">
      <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Powering the next generation of on-chain builders
      </p>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-marquee flex w-max items-center gap-14 whitespace-nowrap">
          {row.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-xl font-medium text-muted-foreground/60 transition-colors hover:text-accent-cyan sm:text-2xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
