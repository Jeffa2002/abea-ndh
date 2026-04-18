// @ts-nocheck
import Link from 'next/link'

const pillars = [
  {
    name: 'Venues',
    icon: '🏛️',
    color: 'bg-blue-50 border-blue-200',
    desc: 'Convention centres, hotels, and unique venues reporting occupancy rates, total capacity, events hosted, revenue per delegate, average event size, and lead times. Venues gain benchmarks to optimise space utilisation and pricing strategy.',
  },
  {
    name: 'Organisers',
    icon: '📋',
    color: 'bg-teal-50 border-teal-200',
    desc: 'Event management companies and PCOs reporting delegate volumes, event budgets, repeat client rates, and international delegate percentages. Organisers can benchmark client retention and growth against national peers.',
  },
  {
    name: 'Suppliers',
    icon: '🔧',
    color: 'bg-purple-50 border-purple-200',
    desc: 'AV, catering, décor, and service providers reporting active contracts, average contract values, client retention, revenue growth, and lead times. Suppliers gain insight into market positioning and pricing norms.',
  },
  {
    name: 'Bureaux',
    icon: '🌏',
    color: 'bg-orange-50 border-orange-200',
    desc: 'Convention bureaux and destination organisations reporting bids submitted, win rates, economic impact, delegate nights, and international events won. Bureaux can track ROI and competitiveness in the global bidding market.',
  },
]

const protections = [
  { icon: '🔒', title: 'Anonymised at Submission', desc: 'Your organisation name is never attached to published data. Metrics are stripped of identifying context before aggregation.' },
  { icon: '📊', title: 'Minimum 5 Organisations', desc: 'Benchmark results only publish when at least 5 organisations have contributed to that metric. No benchmark ever reflects fewer than 5 data points.' },
  { icon: '🚫', title: 'No Individual Data Published', desc: 'We never publish, share, or expose individual organisation data. You only ever see aggregated, anonymised industry-wide benchmarks.' },
  { icon: '🔐', title: 'Secure Platform', desc: 'Data is encrypted in transit and at rest. Access is role-controlled. Your submissions are visible only to your organisation and ABEA administrators.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Nav */}
      <nav
        style={{ backgroundColor: '#1E3A5F', position: 'sticky', top: 0, zIndex: 50 }}
        className="text-white px-6 py-4 flex items-center justify-between shadow-md"
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded" style={{ backgroundColor: '#00A99D' }} />
          <span className="font-bold text-lg tracking-tight">ABEA National Data Hub</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/about" className="text-white text-sm hidden md:inline font-medium">About</Link>
          <Link href="/login" className="text-white/80 hover:text-white text-sm">Sign In</Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#00A99D' }}
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0d2440 100%)' }} className="text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: 'rgba(0,169,157,0.2)', color: '#00A99D' }}
          >
            🇦🇺 Australia&apos;s First National Business Events Data Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            About the <span style={{ color: '#00A99D' }}>ABEA National Data Hub</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Built by the industry, for the industry — turning fragmented data into a national standard that drives better decisions for every corner of business events.
          </p>
        </div>
      </section>

      {/* What is it */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1E3A5F' }}>What is the ABEA National Data Hub?</h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The ABEA National Data Hub is <strong>Australia&apos;s first national, standardised data platform</strong> for the business events industry. It brings together venues, organisers, suppliers, and bureaux under a common data framework — enabling meaningful benchmarks for the first time.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Before the Hub existed, there was no way to answer basic questions like: <em>How does my occupancy rate compare to similar venues? Are our event budgets competitive? Is our bid win rate above or below industry average?</em> Every organisation tracked metrics differently — or not at all. The Hub changes that.
            </p>
          </div>
        </div>
      </section>

      {/* Why it exists */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1E3A5F' }}>Why It Exists</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { icon: '🧩', title: 'Fragmented Data', desc: 'Every organisation measured differently. No common definitions, no compatible formats, no ability to compare.' },
                { icon: '📉', title: 'No Benchmarks', desc: 'Without industry-wide data, organisations had no reference point for performance. Strategy was based on gut feel.' },
                { icon: '🦯', title: 'Flying Blind', desc: 'Boards, associations, and government bodies lacked evidence to advocate for the sector or set credible targets.' },
              ].map(item => (
                <div key={item.title} className="text-center p-6 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-base mb-2" style={{ color: '#1E3A5F' }}>{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed">
              The Hub solves all three. By establishing a common metric framework and aggregating data across the industry, it gives every participating organisation access to benchmarks they could never have built alone — and gives the sector a credible, evidence-based voice.
            </p>
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-10 border" style={{ backgroundColor: '#1E3A5F' }}>
            <h2 className="text-3xl font-bold mb-2 text-white">How Your Data Is Protected</h2>
            <p className="text-white/60 mb-8">Your data is safe. Here&apos;s exactly how we handle it.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {protections.map(p => (
                <div key={p.title} className="bg-white/10 rounded-xl p-6 border border-white/10">
                  <div className="text-2xl mb-3">{p.icon}</div>
                  <h3 className="font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1E3A5F' }}>The Four Industry Pillars</h2>
            <p className="text-gray-500 mb-8">The Hub covers the full business events ecosystem through four defined pillars.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map(p => (
                <div key={p.name} className={`rounded-xl p-6 border ${p.color}`}>
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1E3A5F' }}>{p.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who's behind it */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1E3A5F' }}>Who&apos;s Behind It</h2>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl" style={{ backgroundColor: '#00A99D' }}>
                🤝
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1E3A5F' }}>ABEA — Australian Business Events Association</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The National Data Hub is an initiative of the <strong>Australian Business Events Association (ABEA)</strong>, the peak body representing Australia&apos;s business events industry. ABEA developed the Hub in partnership with member organisations across all four pillars — ensuring the metric framework reflects what the industry actually needs to measure.
                </p>
                <p className="text-gray-600 leading-relaxed text-sm">
                  The platform is governed by ABEA and operated on behalf of the industry. Data contribution is voluntary and open to all ABEA member organisations. Benchmark access is available to all contributing members as part of their membership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-12 text-center text-white" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0d2440 100%)' }}>
            <h2 className="text-3xl font-bold mb-4">Ready to join the Hub?</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto text-lg">
              Register your organisation today and start contributing to — and benefiting from — Australia&apos;s national business events data standard.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#00A99D' }}
              >
                Register Your Organisation
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl font-bold text-white/80 hover:text-white border border-white/20 text-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1E3A5F' }} className="px-6 pt-12 pb-6 text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: '#00A99D' }} />
              <span className="font-bold text-base tracking-tight">ABEA National Data Hub</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Australia&apos;s national business events data standard.
            </p>
          </div>
          <div>
            <h4 className="text-white/80 text-xs uppercase tracking-widest font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home', href: '/' },
                { label: 'About', href: '/about' },
                { label: 'Register', href: '/register' },
                { label: 'Sign In', href: '/login' },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/60 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
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
