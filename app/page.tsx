import Link from 'next/link'
import Image from 'next/image'
import StatsBar from '@/components/StatsBar'
import { INPUT_CATEGORY_CAVEAT, UPDATED_INPUT_CATEGORIES } from '@/lib/inputCategories'

const pillars = [
  {
    name: 'Venues',
    label: 'VEN',
    desc: 'Convention centres, hotels, and unique venues reporting occupancy, capacity, event volume, revenue, and delegate metrics.',
    accent: '#1C4DA1',
    tint: 'rgba(28,77,161,0.08)',
  },
  {
    name: 'Organisers',
    label: 'ORG',
    desc: 'Event management companies and PCOs tracking participant spend, event and shoulder days, exhibiting costs, organiser spend, and national/international segmentation.',
    accent: '#F99F38',
    tint: 'rgba(249,159,56,0.14)',
  },
  {
    name: 'Suppliers',
    label: 'SUP',
    desc: 'AV, catering, production, and service providers benchmarking contract value, demand, lead times, and client retention.',
    accent: '#EF3D55',
    tint: 'rgba(239,61,85,0.1)',
  },
  {
    name: 'Bureaux',
    label: 'BUR',
    desc: 'Convention bureaux and destination organisations comparing bids, win rates, economic impact, and delegate nights.',
    accent: '#00A7E2',
    tint: 'rgba(0,167,226,0.1)',
  },
]

const steps = [
  {
    n: '01',
    title: 'Contribute standardised data',
    desc: 'Members submit agreed metrics through a secure portal or CSV template so the industry can compare like with like.',
  },
  {
    n: '02',
    title: 'Aggregate with protection',
    desc: 'Organisation-level records stay private. Benchmarks publish only when enough contributors exist to protect anonymity.',
  },
  {
    n: '03',
    title: 'Use evidence with confidence',
    desc: 'Members and ABEA can use benchmark trends to plan, advocate, invest, and show the value of business events.',
  },
]

const valueProps = [
  {
    title: 'A common data language',
    desc: 'Shared definitions across venues, organisers, suppliers, and bureaux reduce fragmented reporting and make new input categories easier to compare.',
  },
  {
    title: 'Benchmarks members can trust',
    desc: 'Participating organisations see anonymised national and peer-group signals without exposing individual commercial data.',
  },
  {
    title: 'A stronger advocacy base',
    desc: 'ABEA can present clearer evidence for an industry that connects people, trade, learning, and innovation.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--abea-light-grey)] text-[var(--abea-black)]">
      <nav className="sticky top-0 z-50 bg-[var(--abea-royalist)] px-6 py-4 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-4">
            <Image
              src="/brand/abea-logo-foot.png"
              alt="Australian Business Events Association"
              width={236}
              height={49}
              className="abea-logo h-11 w-auto max-w-[200px]"
              priority
            />
            <span className="hidden border-l border-white/20 pl-4 text-sm font-semibold text-white/70 sm:inline">
              National Data Hub
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/about" className="hidden text-white/70 transition-colors hover:text-white md:inline">
              About
            </Link>
            <Link href="/methodology" className="hidden text-white/70 transition-colors hover:text-white md:inline">
              Methodology
            </Link>
            <Link href="#how-it-works" className="hidden text-white/70 transition-colors hover:text-white md:inline">
              How it works
            </Link>
            <Link href="/login" className="text-white/80 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[var(--abea-sunday)] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <section className="brand-hero px-6 py-20 text-white md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[var(--abea-sky)]">
              United, for real impact
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              Australia&apos;s national benchmark for business events.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
              The ABEA National Data Hub gives the business events industry a shared evidence base across venues, organisers, suppliers, and bureaux.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-[var(--abea-sunday)] px-7 py-4 text-base font-bold text-white shadow-lg shadow-black/15 transition-opacity hover:opacity-90"
              >
                Join the Hub
              </Link>
              <Link
                href="/about"
                className="rounded-lg border border-white/20 px-7 py-4 text-base font-bold text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/12 bg-white/[0.08] p-6 shadow-2xl shadow-black/15 backdrop-blur">
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/12 pb-5">
              <div>
                <p className="text-sm font-semibold uppercase text-[var(--abea-sunday)]">Business events</p>
                <p className="mt-1 text-2xl font-bold">Trade. Meet. Connect. Learn. Innovate.</p>
              </div>
              <div className="hidden h-14 w-14 items-center justify-center rounded-lg bg-[var(--abea-hibiscus)] text-lg font-black sm:flex">
                A
              </div>
            </div>
            <div className="grid gap-3">
              {pillars.map((pillar) => (
                <div key={pillar.name} className="flex items-start gap-4 rounded-lg bg-white/10 p-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-xs font-black tracking-wide text-white"
                    style={{ backgroundColor: pillar.accent }}
                  >
                    {pillar.label}
                  </div>
                  <div>
                    <h2 className="font-bold">{pillar.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-white/68">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StatsBar />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase text-[var(--abea-marine)]">Why it matters</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)] md:text-4xl">
              A practical data standard for a national industry.
            </h2>
            <p className="mt-4 leading-7 text-gray-700">
              Business events underpin sectors across the Australian economy. The Hub turns scattered reporting into benchmarks that members can use and ABEA can advocate from.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {valueProps.map((item, index) => (
              <div key={item.title} className="rounded-lg border border-black/5 bg-white p-7 shadow-sm">
                <div className="mb-5 h-1.5 w-16 rounded-full" style={{ backgroundColor: index === 1 ? '#F99F38' : index === 2 ? '#EF3D55' : '#1C4DA1' }} />
                <h3 className="text-xl font-bold text-[var(--abea-royalist)]">{item.title}</h3>
                <p className="mt-3 leading-7 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase text-[var(--abea-hibiscus)]">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">From member data to industry evidence.</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="rounded-lg border border-gray-200 p-7">
                <div className="mb-6 text-5xl font-black text-[var(--abea-sunday)]/30">{step.n}</div>
                <h3 className="text-lg font-bold text-[var(--abea-royalist)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase text-[var(--abea-hibiscus)]">Updated input categories</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">
              Economic-impact inputs now separate participant and organiser spend.
            </h2>
            <p className="mt-4 leading-7 text-gray-700">
              The Hub now reflects the latest vendor input model for delegates, exhibitors, and organisers, including national and international segmentation.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {UPDATED_INPUT_CATEGORIES.map((category) => (
              <div key={category.title} className="rounded-lg border border-black/5 bg-white p-7 shadow-sm">
                <div className="mb-5 h-1.5 w-16 rounded-full" style={{ backgroundColor: category.accent }} />
                <h3 className="text-xl font-bold text-[var(--abea-royalist)]">{category.title}</h3>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-gray-700">
                  {category.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: category.accent }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm italic text-gray-500">{INPUT_CATEGORY_CAVEAT}</p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase text-[var(--abea-marine)]">Four industry pillars</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">Coverage across the full business events ecosystem.</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar.name} className="rounded-lg border p-7" style={{ backgroundColor: pillar.tint, borderColor: `${pillar.accent}33` }}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-md px-3 py-2 text-xs font-black tracking-wide text-white" style={{ backgroundColor: pillar.accent }}>
                    {pillar.label}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--abea-royalist)]">{pillar.name}</h3>
                </div>
                <p className="leading-7 text-gray-700">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase text-[var(--abea-hibiscus)]">Evidence with care</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">Designed for useful insight without exposing individual organisations.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Anonymised benchmark outputs',
              'Minimum contribution thresholds',
              'Role-controlled member access',
              'Sector-wide reporting for advocacy',
            ].map((item) => (
              <div key={item} className="rounded-lg border border-gray-200 bg-[var(--abea-light-grey)] p-5 font-semibold text-[var(--abea-royalist)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--abea-royalist)] px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to benchmark your organisation?</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/70">
          Register to contribute to the national data standard and help build the evidence base for Australian business events.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-lg bg-[var(--abea-sunday)] px-8 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
        >
          Register Your Organisation
        </Link>
      </section>

      <footer className="bg-[var(--abea-royalist)] px-6 pb-6 pt-12 text-white">
        <div className="mx-auto mb-10 grid max-w-6xl grid-cols-1 gap-10 border-t border-white/10 pt-10 md:grid-cols-3">
          <div>
            <Image src="/brand/abea-logo-foot.png" alt="Australian Business Events Association" width={273} height={56} className="abea-logo mb-4 h-14 w-auto max-w-[230px]" />
            <p className="text-sm leading-relaxed text-white/55">
              Australia&apos;s national business events data standard.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/80">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Methodology', href: '/methodology' },
                { label: 'Register', href: '/register' },
                { label: 'Sign In', href: '/login' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/80">Contact</h4>
            <p className="mb-1 text-sm text-white/60">
              <a href="mailto:admin@abea.org.au" className="transition-colors hover:text-white">
                admin@abea.org.au
              </a>
            </p>
            <p className="text-sm text-white/60">© 2026 ABEA National Data Hub</p>
          </div>
        </div>
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs text-white/35">Prototype v0.1 - data is anonymised and aggregated</p>
        </div>
      </footer>
    </div>
  )
}
