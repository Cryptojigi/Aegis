import Image from 'next/image'
import { Code2, Send, MessagesSquare } from 'lucide-react'

const socials = [
  { label: 'GitHub', href: '#', icon: Code2 },
  { label: 'Twitter / X', href: '#', icon: Send },
  { label: 'Discord', href: '#', icon: MessagesSquare },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/30 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 sm:flex-row">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div className="flex items-center gap-2.5">
            <Image
              src="/aegis-logo.png"
              alt="Aegis logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain mix-blend-screen"
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              Aegis
            </span>
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent-cyan">
            Built for the OKX.AI Genesis Hackathon
          </p>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Aegis. All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan"
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
