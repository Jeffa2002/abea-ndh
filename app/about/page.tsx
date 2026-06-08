import Link from 'next/link'
import Image from 'next/image'
import { INPUT_CATEGORY_CAVEAT, UPDATED_INPUT_CATEGORIES } from '@/lib/inputCategories'

const pillars = [
  {
    name: 'Venues',
    label: 'VEN',
    accent: '#1C4DA1',
    tint: 'rgba(28,77,161,0.08)',
    desc: 'Convention centres, hotels, and unique venues reporting occupancy rates, capacity, events hosted, revenue per delegate, average event size, and lead times.',
  },
  {
    name: 'Organisers',
    label: 'ORG',
    accent: '#F99F38',
    tint: 'rgba(249,159,56,0.14)',
    desc: 'Event management companies and PCOs reporting delegate and exhibitor spend, event and shoulder days, accompanying guests, exhibiting costs, organiser spend into Victoria, and national/international segmentation.',
  },
  {
    name: 'Suppliers',
    label: 'SUP',
    accent: '#EF3D55',
    tint: 'rgba(239,61,85,0.1)',
    desc: 'AV, catering, production, decor, and service providers reporting active contracts, contract values, retention, growth, and lead times.',
  },
  {
    name: 'Bureaux',
    label: 'BUR',
    accent: '#00A7E2',
    tint: 'rgba(0,167,226,0.1)',
    desc: 'Convention bureaux and destination organisations reporting bids submitted, win rates, economic impact, delegate nights, and international events won.',
  },
]

const protections = [
  {
    title: 'Anonymised before benchmarks',
    desc: 'Organisation names are not attached to published benchmark outputs.',
  },
  {
    title: 'Minimum contribution thresholds',
    desc: 'Benchmarks publish only when enough organisations have contributed to protect anonymity.',
  },
  {
    title: 'No individual records exposed',
    desc: 'Members see aggregated industry and peer-group signals, not other organisations&apos; raw submissions.',
  },
  {
    title: 'Role-controlled access',
    desc: 'Submissions are visible to the contributing organisation and authorised ABEA administrators.',
  },
]

export default function AboutPage() {
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
            <Link href="/" className="hidden text-white/70 transition-colors hover:text-white md:inline">
              Home
            </Link>
            <Link href="/methodology" className="hidden text-white/70 transition-colors hover:text-white md:inline">
              Methodology
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

      <section className="brand-hero px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[var(--abea-sky)]">
            About the National Data Hub
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
            Building a shared evidence base for Australian business events.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76">
            The Hub brings ABEA members into one standardised data framework so the sector can benchmark performance, identify trends, and advocate with clearer evidence.
          </p>
        </div>
      </section>

      <main className="px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="rounded-lg border border-black/5 bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-bold uppercase text-[var(--abea-hibiscus)]">What it is</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">A national standard for industry data.</h2>
            <div className="mt-6 grid gap-6 text-base leading-8 text-gray-700 md:grid-cols-2">
              <p>
                The ABEA National Data Hub is a standardised platform for collecting and benchmarking business events data across venues, organisers, suppliers, and bureaux.
              </p>
              <p>
                It gives participating members access to comparable, anonymised benchmarks and gives ABEA a stronger evidence base for sector-wide advocacy.
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-black/5 bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-bold uppercase text-[var(--abea-marine)]">Why it exists</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">Business events need evidence that matches their economic role.</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  title: 'Fragmented inputs',
                  desc: 'Different organisations track different metrics, definitions, and reporting cycles.',
                },
                {
                  title: 'Limited benchmarks',
                  desc: 'Without common data, members have little context for performance, planning, and investment.',
                },
                {
                  title: 'Weaker advocacy',
                  desc: 'Associations and government need credible evidence to understand sector needs and opportunities.',
                },
              ].map((item, index) => (
                <div key={item.title} className="rounded-lg bg-[var(--abea-light-grey)] p-6">
                  <div className="mb-5 h-1.5 w-14 rounded-full" style={{ backgroundColor: index === 1 ? '#F99F38' : index === 2 ? '#EF3D55' : '#1C4DA1' }} />
                  <h3 className="font-bold text-[var(--abea-royalist)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-black/5 bg-[var(--abea-royalist)] p-8 text-white shadow-sm md:p-10">
            <p className="text-sm font-bold uppercase text-[var(--abea-sunday)]">Data protection</p>
            <h2 className="mt-3 text-3xl font-bold">Useful benchmarks without exposing individual organisations.</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {protections.map((item) => (
                <div key={item.title} className="rounded-lg border border-white/12 bg-white/10 p-6">
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-black/5 bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-bold uppercase text-[var(--abea-hibiscus)]">Industry pillars</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">A framework for the full business events ecosystem.</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {pillars.map((pillar) => (
                <div key={pillar.name} className="rounded-lg border p-6" style={{ backgroundColor: pillar.tint, borderColor: `${pillar.accent}33` }}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-md px-3 py-2 text-xs font-black tracking-wide text-white" style={{ backgroundColor: pillar.accent }}>
                      {pillar.label}
                    </div>
                    <h3 className="text-lg font-bold text-[var(--abea-royalist)]">{pillar.name}</h3>
                  </div>
                  <p className="text-sm leading-7 text-gray-700">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-black/5 bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-bold uppercase text-[var(--abea-marine)]">Updated methodology input</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">Current economic-impact categories.</h2>
            <p className="mt-4 max-w-3xl leading-8 text-gray-700">
              The Hub has been aligned to the latest vendor input categories so future submissions can distinguish participant-side spend from organiser-side direct spend.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {UPDATED_INPUT_CATEGORIES.map((category) => (
                <div key={category.title} className="rounded-lg border p-6" style={{ borderColor: `${category.accent}33`, backgroundColor: `${category.accent}14` }}>
                  <h3 className="text-lg font-bold text-[var(--abea-royalist)]">{category.title}</h3>
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
          </section>

          <section className="rounded-lg border border-black/5 bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-bold uppercase text-[var(--abea-marine)]">Who is behind it</p>
            <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--abea-sunday)] text-2xl font-black text-white">
                A
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--abea-royalist)]">Australian Business Events Association</h2>
                <p className="mt-4 leading-8 text-gray-700">
                  The National Data Hub is an ABEA initiative for members and the wider business events industry. It supports a united voice for real impact by turning sector participation into clearer benchmarks and advocacy evidence.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg bg-[var(--abea-royalist)] p-8 text-center text-white md:p-12">
            <h2 className="text-3xl font-bold">Ready to join the Hub?</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/70">
              Register your organisation to contribute to and benefit from Australia&apos;s national business events data standard.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-[var(--abea-sunday)] px-8 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                Register Your Organisation
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-white/20 px-8 py-4 text-base font-bold text-white/80 transition-colors hover:border-white/40 hover:text-white"
              >
                Sign In
              </Link>
            </div>
          </section>
        </div>
      </main>

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
