import Image from 'next/image'
import { BRAND_COLOR_USAGE, BRAND_IDENTITY, PILLAR_COLORS } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export default function BrandGuidePage() {
  const pillars = Object.entries(PILLAR_COLORS)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Brand Guide</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          Admin reference for keeping the Hub, reports, exports, and stakeholder review pages aligned to the ABEA identity.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="rounded-xl p-6" style={{ backgroundColor: '#052460' }}>
            <Image src="/brand/abea-logo-foot.png" alt={BRAND_IDENTITY.organisationName} width={236} height={49} className="abea-logo h-12 w-auto" />
          </div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-gray-600">
            <div><span className="font-semibold text-gray-900">Organisation:</span> {BRAND_IDENTITY.organisationName}</div>
            <div><span className="font-semibold text-gray-900">Product:</span> {BRAND_IDENTITY.productName}</div>
            <div><span className="font-semibold text-gray-900">Short name:</span> {BRAND_IDENTITY.shortName}</div>
            <div><span className="font-semibold text-gray-900">Tagline:</span> {BRAND_IDENTITY.tagline}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-900">Brand Use Rules</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ['Use Royalist Blue for authority', 'Navigation, report covers, admin headings, and primary governance actions should lead with Royalist Blue.'],
              ['Use Sunday Yellow for active emphasis', 'Primary CTAs, selected states, review moments, and highlight accents should use Sunday Yellow.'],
              ['Keep reports restrained', 'Board and government pages should feel evidence-led: dense, clear, and calm rather than promotional.'],
              ['Protect pillar colour meaning', 'Venue, organiser, supplier, and bureau colours should stay consistent across charts, tags, and reports.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl bg-[var(--abea-light-grey)] p-5">
                <div className="font-semibold text-[var(--abea-royalist)]">{title}</div>
                <p className="mt-2 text-sm leading-6 text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-gray-900">Colour System</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {BRAND_COLOR_USAGE.map(color => (
            <div key={color.token} className="overflow-hidden rounded-xl border border-gray-100">
              <div className="h-20" style={{ backgroundColor: color.hex }} />
              <div className="p-4">
                <div className="font-bold text-gray-900">{color.name}</div>
                <div className="mt-1 font-mono text-xs text-gray-400">{color.hex}</div>
                <p className="mt-3 text-xs leading-5 text-gray-600">{color.use}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-gray-900">Pillar Colours</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {pillars.map(([pillar, color]) => (
            <div key={pillar} className="rounded-xl border border-gray-100 p-5">
              <div className="mb-4 h-2 rounded-full" style={{ backgroundColor: color }} />
              <div className="font-bold text-gray-900">{pillar}</div>
              <div className="mt-1 font-mono text-xs text-gray-400">{color}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
