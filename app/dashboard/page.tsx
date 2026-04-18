// @ts-nocheck
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const PILLAR_COLORS: Record<string, string> = {
  VENUE: '#3B82F6', ORGANISER: '#00A99D', SUPPLIER: '#8B5CF6', BUREAU: '#F97316'
}

function formatValue(value: number, unit: string) {
  if (unit === 'AUD') return `$${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value.toFixed(0)}`
  if (unit === 'percent') return `${value.toFixed(1)}%`
  return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString()
}

function calcPercentile(val: number, p25: number, avg: number, p75: number): number {
  if (val <= p25) return Math.round((val / p25) * 25)
  if (val <= avg) return Math.round(25 + ((val - p25) / (avg - p25)) * 25)
  if (val <= p75) return Math.round(50 + ((val - avg) / (p75 - avg)) * 25)
  return Math.min(99, Math.round(75 + ((val - p75) / (p75 * 0.5)) * 25))
}

function dataQualityLabel(score: number): string {
  if (score > 80) return 'Great'
  if (score > 50) return 'Good'
  return 'Needs work'
}

function dataQualityLabelColor(score: number): string {
  if (score > 80) return '#00A99D'
  if (score > 50) return '#F97316'
  return '#EF4444'
}

const QUICK_ACTIONS = [
  {
    icon: '📤',
    title: 'Submit Data',
    desc: 'Add metrics for a new period',
    href: '/dashboard/submit',
  },
  {
    icon: '📊',
    title: 'View Benchmarks',
    desc: 'See how you compare',
    href: '/dashboard/benchmarks',
  },
  {
    icon: '📁',
    title: 'My Submissions',
    desc: 'View submission history',
    href: '/dashboard/submissions',
  },
]

export default async function DashboardPage() {
  const session = await getSession()
  if (!session || !session.orgId) redirect('/login')

  const org = await prisma.organisation.findUnique({ where: { id: session.orgId } })
  if (!org) redirect('/login')

  const submissions = await prisma.dataSubmission.findMany({ where: { orgId: org.id }, orderBy: { createdAt: 'desc' } })
  const latestProcessed = submissions.find(s => s.status === 'PROCESSED')

  const myMetrics = latestProcessed
    ? await prisma.metricValue.findMany({
        where: { submissionId: latestProcessed.id },
        include: { metric: true },
      })
    : []

  const benchmarks = await prisma.benchmarkSnapshot.findMany({
    where: { pillar: org.pillar, period: latestProcessed?.period || '2024-FY' },
  })

  const benchmarkByCode = Object.fromEntries(benchmarks.map(b => [b.metricCode, b]))
  const allPillarMetrics = await prisma.metricDefinition.findMany({ where: { pillar: org.pillar } })
  const submittedCodes = new Set(myMetrics.map(m => m.metric.code))
  const dataQuality = allPillarMetrics.length > 0 ? Math.round((submittedCodes.size / allPillarMetrics.length) * 100) : 0
  const qualityLabel = dataQualityLabel(dataQuality)
  const qualityColor = dataQualityLabelColor(dataQuality)

  const color = PILLAR_COLORS[org.pillar] || '#1E3A5F'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Welcome back, {org.name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: color }}>{org.pillar}</span>
          <span className="text-gray-500 text-sm">{org.region} · {org.tier}</span>
          {!org.isApproved && <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Pending Approval</span>}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Data quality card with progress bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Data Quality Score</div>
          <div className="text-4xl font-black" style={{ color }}>{dataQuality}%</div>
          <div className="text-xs text-gray-400 mt-1 mb-3">{submittedCodes.size}/{allPillarMetrics.length} metrics submitted</div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ backgroundColor: '#00A99D', width: `${dataQuality}%` }}
            />
          </div>
          <div className="text-xs font-semibold" style={{ color: qualityColor }}>{qualityLabel}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Total Submissions</div>
          <div className="text-4xl font-black" style={{ color: '#1E3A5F' }}>{submissions.length}</div>
          <div className="text-xs text-gray-400 mt-1">All time</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Latest Period</div>
          <div className="text-2xl font-black" style={{ color: '#1E3A5F' }}>{latestProcessed?.period || '—'}</div>
          <div className="text-xs text-gray-400 mt-1">{latestProcessed ? 'Processed' : 'No data yet'}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Benchmarks Available</div>
          <div className="text-4xl font-black" style={{ color: '#1E3A5F' }}>{benchmarks.length}</div>
          <div className="text-xs text-gray-400 mt-1">Industry metrics</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {QUICK_ACTIONS.map(action => (
          <a
            key={action.href}
            href={action.href}
            className="group flex items-center bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 hover:border-teal-300 hover:shadow-md transition-all duration-150"
            style={{ borderLeftWidth: '4px', borderLeftColor: '#00A99D' }}
          >
            <div className="text-2xl mr-4 flex-shrink-0">{action.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm" style={{ color: '#1E3A5F' }}>{action.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">{action.desc}</div>
            </div>
            <div className="ml-3 flex-shrink-0 text-gray-300 group-hover:text-teal-400 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Metric comparison cards */}
      {myMetrics.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#1E3A5F' }}>Your Metrics vs Industry Benchmarks ({latestProcessed?.period})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myMetrics.map(mv => {
              const bm = benchmarkByCode[mv.metric.code]
              const pct = bm ? calcPercentile(mv.value, bm.p25Value || 0, bm.avgValue, bm.p75Value || 0) : null
              return (
                <div key={mv.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{mv.metric.label}</div>
                  <div className="text-2xl font-black mb-1" style={{ color }}>{formatValue(mv.value, mv.metric.unit)}</div>
                  {bm && (
                    <>
                      <div className="text-xs text-gray-500 mb-3">Industry avg: {formatValue(bm.avgValue, mv.metric.unit)}</div>
                      {/* Gauge bar */}
                      <div className="relative h-2 bg-gray-100 rounded-full mb-2">
                        <div className="absolute h-full rounded-full opacity-30" style={{ backgroundColor: color, width: '100%' }} />
                        <div className="absolute h-full rounded-full" style={{ backgroundColor: color, width: `${pct}%` }} />
                      </div>
                      <div className="text-xs font-semibold" style={{ color }}>{pct}th percentile</div>
                    </>
                  )}
                  {!bm && <div className="text-xs text-gray-400">No benchmark yet</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Improved empty state — onboarding guide */}
      {myMetrics.length === 0 && (
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-1" style={{ color: '#1E3A5F' }}>Get started with your data</h2>
          <p className="text-sm text-gray-500 mb-8">Follow these steps to unlock your benchmarks.</p>
          <div className="space-y-4 max-w-lg">
            {/* Step 1 — done */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#00A99D' }}>
                ✓
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-700">Account approved</div>
                <div className="text-xs text-gray-400 mt-0.5">You're in — your organisation is verified.</div>
              </div>
            </div>
            {/* Connector */}
            <div className="ml-4 w-px h-4 bg-gray-200" />
            {/* Step 2 — CTA */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#00A99D' }}>
                2
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-800">Submit your first dataset</div>
                <div className="text-xs text-gray-400 mt-0.5 mb-3">Enter your organisation's metrics for the current period.</div>
                <a
                  href="/dashboard/submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#00A99D' }}
                >
                  📤 Submit Data Now
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
            {/* Connector */}
            <div className="ml-4 w-px h-4 bg-gray-200" />
            {/* Step 3 — pending */}
            <div className="flex items-start gap-4 opacity-40">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold border-2 border-gray-300">
                3
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-500">📊 View your benchmarks</div>
                <div className="text-xs text-gray-400 mt-0.5">See how you stack up against the industry — available after your first submission.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
