import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const PILLAR_COLORS: Record<string, string> = {
  VENUE: '#3B82F6', ORGANISER: '#00A99D', SUPPLIER: '#8B5CF6', BUREAU: '#F97316'
}

function formatValue(value: number, unit: string) {
  if (unit === 'AUD') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }
  if (unit === 'percent') return `${value.toFixed(1)}%`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(0)
}

function calcPercentile(val: number, p25: number, avg: number, p75: number): number {
  if (val <= p25) return Math.round((val / p25) * 25)
  if (val <= avg) return Math.round(25 + ((val - p25) / (avg - p25)) * 25)
  if (val <= p75) return Math.round(50 + ((val - avg) / (p75 - avg)) * 25)
  return Math.min(99, Math.round(75 + ((val - p75) / (p75 * 0.5)) * 25))
}

export default async function BenchmarksPage() {
  const session = await getSession()
  if (!session || !session.orgId) redirect('/login')

  const org = await prisma.organisation.findUnique({ where: { id: session.orgId } })
  if (!org) redirect('/login')

  const benchmarks = await prisma.benchmarkSnapshot.findMany({
    where: { pillar: org.pillar, period: '2024-FY' },
  })

  const mySubmission = await prisma.dataSubmission.findFirst({
    where: { orgId: org.id, status: 'PROCESSED' },
    include: { metrics: { include: { metric: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const myMetricByCode = mySubmission
    ? Object.fromEntries(mySubmission.metrics.map(m => [m.metric.code, m.value]))
    : {}

  const color = PILLAR_COLORS[org.pillar] || '#1E3A5F'

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>Industry Benchmarks</h1>
      <p className="text-gray-500 text-sm mb-2">
        <span className="px-2 py-1 rounded text-xs font-bold text-white mr-2" style={{ backgroundColor: color }}>{org.pillar}</span>
        Your pillar — 2024-FY · All data anonymised
      </p>
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 mb-8">
        🔒 Benchmarks are calculated from aggregated, anonymised data. Individual organisations are never identifiable.
      </div>

      {benchmarks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="font-bold text-lg mb-2">No benchmarks available yet</h3>
          <p className="text-gray-500 text-sm">Benchmarks are published once enough organisations have submitted data.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#1E3A5F' }}>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wide">Metric</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wide">Your Value</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wide">P25</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wide">Industry Avg</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wide">P75</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wide">Your Percentile</th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-white/70 uppercase tracking-wide">Trend</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b, i) => {
                const myVal = myMetricByCode[b.metricCode]
                const pct = myVal !== undefined ? calcPercentile(myVal, b.p25Value || 0, b.avgValue, b.p75Value || 0) : null
                const unit = b.metricCode.includes('RATE') || b.metricCode.includes('PCT') || b.metricCode.includes('WIN') || b.metricCode.includes('GROWTH') || b.metricCode.includes('REPEAT') || b.metricCode.includes('INTL_DELEGATE') ? 'percent' :
                  b.metricCode.includes('VALUE') || b.metricCode.includes('IMPACT') || b.metricCode.includes('SPEND') || b.metricCode.includes('BUDGET') || b.metricCode.includes('REVENUE') || b.metricCode.includes('DELEGATE_SPEND') ? 'AUD' : 'count'
                const trend = myVal !== undefined && myVal > b.avgValue ? '↑' : myVal !== undefined && myVal < b.avgValue ? '↓' : '—'
                const trendColor = trend === '↑' ? '#10B981' : trend === '↓' ? '#EF4444' : '#9CA3AF'
                return (
                  <tr key={b.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{b.metricCode.split('_').slice(1).join(' ')}</div>
                      <div className="text-xs text-gray-400">n={b.sampleSize} orgs</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-sm" style={{ color }}>
                      {myVal !== undefined ? formatValue(myVal, unit) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">{formatValue(b.p25Value || 0, unit)}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{formatValue(b.avgValue, unit)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">{formatValue(b.p75Value || 0, unit)}</td>
                    <td className="px-6 py-4 text-right">
                      {pct !== null ? (
                        <div>
                          <div className="h-2 bg-gray-100 rounded-full w-24 ml-auto mb-1">
                            <div className="h-full rounded-full" style={{ backgroundColor: color, width: `${pct}%` }} />
                          </div>
                          <div className="text-xs font-bold text-right" style={{ color }}>{pct}th</div>
                        </div>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-lg" style={{ color: trendColor }}>{trend}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
