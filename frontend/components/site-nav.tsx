'use client'

import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300 sm:px-6 ${
          scrolled
            ? 'glass border-border shadow-lg shadow-black/30'
            : 'border-transparent'
        }`}
      >
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <Image
              src="/aegis-logo.png"
              alt="Aegis logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain mix-blend-screen"
              priority
            />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Aegis
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#developers"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            View Docs
          </a>
          <a
            href="https://okx.com/agent-store"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-accent-cyan/50 hover:bg-accent"
          >
            Hire on OKX Agent Store
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </nav>
    </header>
  )
}
