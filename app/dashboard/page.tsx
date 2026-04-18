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

      {/* Data quality */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Data Quality Score</div>
          <div className="text-4xl font-black" style={{ color }}>{dataQuality}%</div>
          <div className="text-xs text-gray-400 mt-1">{submittedCodes.size}/{allPillarMetrics.length} metrics submitted</div>
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

      {myMetrics.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">📤</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#1E3A5F' }}>No data submitted yet</h3>
          <p className="text-gray-500 text-sm mb-6">Submit your first data set to see how you compare against industry benchmarks.</p>
          <a href="/dashboard/submit" className="inline-block px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: '#00A99D' }}>
            Submit Data Now
          </a>
        </div>
      )}
    </div>
  )
}
