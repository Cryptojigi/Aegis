import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { TrustBar } from '@/components/trust-bar'
import { Capabilities } from '@/components/capabilities'
import { Process } from '@/components/process'
import { Infrastructure } from '@/components/infrastructure'
import { Integrations } from '@/components/integrations'
import { Security } from '@/components/security'
import { ForDevelopers } from '@/components/for-developers'
import { FinalCta } from '@/components/final-cta'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <main className="relative min-h-screen bg-background">
      <SiteNav />
      <Hero />
      <TrustBar />
      <Capabilities />
      <Process />
      <Infrastructure />
      <Integrations />
      <Security />
      <ForDevelopers />
      <FinalCta />
      <SiteFooter />
    </main>
  )
}
