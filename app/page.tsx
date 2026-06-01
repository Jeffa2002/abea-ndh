import Link from 'next/link'
import Image from 'next/image'
import StatsBar from '@/components/StatsBar'

const pillars = [
  { name: 'Venues', icon: '🏛️', desc: 'Convention centres, hotels, and unique venues reporting occupancy, capacity, and delegate metrics.', color: 'bg-blue-50 border-blue-200' },
  { name: 'Organisers', icon: '📋', desc: 'Event management companies reporting delegate volumes, budgets, and client retention.', color: 'bg-orange-50 border-orange-200' },
  { name: 'Suppliers', icon: '🔧', desc: 'AV, catering, and service providers reporting contracts, retention, and revenue growth.', color: 'bg-purple-50 border-purple-200' },
  { name: 'Bureaux', icon: '🌏', desc: 'Convention bureaux reporting bids, win rates, economic impact, and delegate nights.', color: 'bg-orange-50 border-orange-200' },
]

const steps = [
  { n: '01', title: 'Submit Your Data', desc: 'Upload standardised metrics through our secure portal or CSV template. We normalise inconsistent formats automatically.' },
  { n: '02', title: 'We Anonymise & Aggregate', desc: 'All data is anonymised. Benchmarks only publish when 5+ organisations contribute — your data is never individually identifiable.' },
  { n: '03', title: 'Access Industry Benchmarks', desc: 'See where you sit against your peers. Export insights. Make evidence-based decisions.' },
]

const testimonials = [
  {
    quote: 'Finally a standardised way to measure what matters.',
    name: 'General Manager',
    org: 'Melbourne Convention Bureau',
  },
  {
    quote: 'Our board now has real benchmarks to set targets against.',
    name: 'CEO',
    org: 'National Events Company',
  },
  {
    quote: 'The data quality is excellent. This is what the industry needed.',
    name: 'Director',
    org: 'Sydney Convention Centre',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Nav — sticky */}
      <nav
        style={{ backgroundColor: '#052460', position: 'sticky', top: 0, zIndex: 50 }}
        className="text-white px-6 py-4 flex items-center justify-between shadow-md"
      >
        <div className="flex items-center gap-4">
          <Image src="/brand/abea-logo-foot.png" alt="Australian Business Events Association" width={236} height={49} className="abea-logo h-12 w-auto max-w-[210px]" priority />
          <span className="hidden sm:inline text-white/70 text-sm font-semibold border-l border-white/20 pl-4">National Data Hub</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="#how-it-works" className="text-white/70 hover:text-white text-sm hidden md:inline">
            How It Works
          </Link>
          <Link href="/login" className="text-white/70 hover:text-white text-sm hidden md:inline">
            For Members
          </Link>
          <Link href="/login" className="text-white/80 hover:text-white text-sm">Sign In</Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#F99F38' }}
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #052460 0%, #031B4B 100%)' }} className="text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: 'rgba(249,159,56,0.18)', color: '#F99F38' }}
          >
            🇦🇺 Trusted by 12+ Business Events Organisations
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Australia&apos;s Business Events<br />
            <span style={{ color: '#F99F38' }}>Data Hub</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            The first national platform aggregating standardised data across venues, organisers, suppliers, and bureaux — turning fragmented intelligence into industry-wide benchmarks.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#F99F38' }}
            >
              Join the Hub
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl font-bold text-white/80 hover:text-white border border-white/20 text-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <StatsBar />

      {/* Value Props */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📐', title: 'Standardise', desc: 'Common metric definitions across all four industry pillars. No more comparing apples to oranges.' },
              { icon: '📊', title: 'Benchmark', desc: 'See your performance against anonymised industry peers. Know where you rank — and where to grow.' },
              { icon: '🚀', title: 'Grow', desc: 'Evidence-based decisions for venues, organisers, suppliers, and bureaux. Backed by real data.' },
            ].map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#052460' }}>{v.title}</h3>
                <p className="text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#052460' }}>How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.n} className="relative">
                <div className="text-6xl font-black mb-4" style={{ color: '#F99F38', opacity: 0.2 }}>{s.n}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#052460' }}>{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#052460' }}>Four Industry Pillars</h2>
          <p className="text-center text-gray-500 mb-12">Coverage across the full business events ecosystem</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map(p => (
              <div key={p.name} className={`rounded-2xl p-6 border ${p.color}`}>
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#052460' }}>{p.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#052460' }}>
            Built with the industry, for the industry
          </h2>
          <p className="text-center text-gray-500 mb-12">What our members are saying</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div
                key={t.org}
                className="bg-white rounded-2xl p-8 border border-gray-100"
                style={{ boxShadow: '0 4px 24px rgba(30,58,95,0.08)' }}
              >
                <div className="text-3xl mb-4" style={{ color: '#F99F38' }}>&ldquo;</div>
                <p className="text-gray-700 italic leading-relaxed mb-6">{t.quote}</p>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#052460' }}>{t.name}</div>
                  <div className="text-gray-400 text-sm">{t.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: '#052460' }} className="py-16 px-6 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to benchmark your business?</h2>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">
          Join Australia&apos;s growing community of business events organisations contributing to the national data standard.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#F99F38' }}
        >
          Register Your Organisation
        </Link>
      </section>

      {/* Footer — 3 column */}
      <footer style={{ backgroundColor: '#052460' }} className="px-6 pt-12 pb-6 text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Col 1: Brand */}
          <div>
            <Image src="/brand/abea-logo-foot.png" alt="Australian Business Events Association" width={273} height={56} className="abea-logo h-14 w-auto max-w-[230px] mb-4" />
            <p className="text-white/50 text-sm leading-relaxed">
              Australia&apos;s national business events data standard.
            </p>
          </div>

          {/* Col 2: Links */}
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-widest font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'Register', href: '/register' },
                { label: 'Sign In', href: '/login' },
                { label: 'About', href: '/about' },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-widest font-semibold mb-4">Contact</h4>
            <p className="text-white/60 text-sm mb-1">
              <a href="mailto:admin@abea.org.au" className="hover:text-white transition-colors">
                admin@abea.org.au
              </a>
            </p>
            <p className="text-white/60 text-sm">© 2026 ABEA National Data Hub</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto border-t border-white/10 pt-6 text-center">
          <p className="text-white/30 text-xs">Prototype v0.1 · Data is anonymised and aggregated</p>
        </div>
      </footer>
    </div>
  )
}
