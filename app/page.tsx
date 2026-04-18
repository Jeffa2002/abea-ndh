import Link from 'next/link'

const pillars = [
  { name: 'Venues', icon: '🏛️', desc: 'Convention centres, hotels, and unique venues reporting occupancy, capacity, and delegate metrics.', color: 'bg-blue-50 border-blue-200' },
  { name: 'Organisers', icon: '📋', desc: 'Event management companies reporting delegate volumes, budgets, and client retention.', color: 'bg-teal-50 border-teal-200' },
  { name: 'Suppliers', icon: '🔧', desc: 'AV, catering, and service providers reporting contracts, retention, and revenue growth.', color: 'bg-purple-50 border-purple-200' },
  { name: 'Bureaux', icon: '🌏', desc: 'Convention bureaux reporting bids, win rates, economic impact, and delegate nights.', color: 'bg-orange-50 border-orange-200' },
]

const steps = [
  { n: '01', title: 'Submit Your Data', desc: 'Upload standardised metrics through our secure portal or CSV template. We normalise inconsistent formats automatically.' },
  { n: '02', title: 'We Anonymise & Aggregate', desc: 'All data is anonymised. Benchmarks only publish when 5+ organisations contribute — your data is never individually identifiable.' },
  { n: '03', title: 'Access Industry Benchmarks', desc: 'See where you sit against your peers. Export insights. Make evidence-based decisions.' },
]

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Nav */}
      <nav style={{ backgroundColor: '#1E3A5F' }} className="text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded" style={{ backgroundColor: '#00A99D' }} />
          <span className="font-bold text-lg tracking-tight">ABEA National Data Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-white/80 hover:text-white text-sm">Sign In</Link>
          <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: '#00A99D' }}>
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #0d2440 100%)' }} className="text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: 'rgba(0,169,157,0.2)', color: '#00A99D' }}>
            🇦🇺 National Business Events Intelligence
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Australia&apos;s Business Events<br />
            <span style={{ color: '#00A99D' }}>Data Hub</span>
          </h1>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            The first national platform aggregating standardised data across venues, organisers, suppliers, and bureaux — turning fragmented intelligence into industry-wide benchmarks.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:opacity-90 transition-opacity" style={{ backgroundColor: '#00A99D' }}>
              Join the Hub
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-xl font-bold text-white/80 hover:text-white border border-white/20 text-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

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
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1E3A5F' }}>{v.title}</h3>
                <p className="text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#1E3A5F' }}>How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.n} className="relative">
                <div className="text-6xl font-black mb-4" style={{ color: '#00A99D', opacity: 0.2 }}>{s.n}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1E3A5F' }}>{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#1E3A5F' }}>Four Industry Pillars</h2>
          <p className="text-center text-gray-500 mb-12">Coverage across the full business events ecosystem</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map(p => (
              <div key={p.name} className={`rounded-2xl p-6 border ${p.color}`}>
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#1E3A5F' }}>{p.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: '#1E3A5F' }} className="py-16 px-6 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to benchmark your business?</h2>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">Join Australia&apos;s growing community of business events organisations contributing to the national data standard.</p>
        <Link href="/register" className="inline-block px-8 py-4 rounded-xl font-bold text-white text-lg" style={{ backgroundColor: '#00A99D' }}>
          Register Your Organisation
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-gray-400 text-sm bg-white border-t">
        <p>© 2026 ABEA National Data Hub · Prototype v0.1 · Data is anonymised and aggregated</p>
      </footer>
    </div>
  )
}
