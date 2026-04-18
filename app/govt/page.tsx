import { prisma } from '@/lib/prisma'

const PILLAR_COLORS: Record<string, string> = {
  VENUE: '#3B82F6', ORGANISER: '#00A99D', SUPPLIER: '#8B5CF6', BUREAU: '#F97316'
}
const PILLAR_ICONS: Record<string, string> = {
  VENUE: '🏛️', ORGANISER: '📋', SUPPLIER: '🔧', BUREAU: '🌏'
}

function formatValue(value: number, code: string) {
  const isAUD = code.includes('IMPACT') || code.includes('VALUE') || code.includes('SPEND') || code.includes('BUDGET') || code.includes('REVENUE')
  const isPct = code.includes('RATE') || code.includes('PCT') || code.includes('GROWTH') || code.includes('WIN')
  if (isAUD) {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }
  if (isPct) return `${value.toFixed(1)}%`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toFixed(0)
}

export default async function GovtPage() {
  const pillars = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU'] as const

  const overview = await Promise.all(
    pillars.map(async (pillar) => {
      const snapshots = await prisma.benchmarkSnapshot.findMany({
        where: { pillar, period: '2024-FY' },
      })
      const orgCount = await prisma.organisation.count({ where: { pillar, isApproved: true } })
      const submissionCount = await prisma.dataSubmission.count({ where: { pillar, status: 'PROCESSED' } })
      return { pillar, orgCount, submissionCount, snapshots }
    })
  )

  const economicImpact = await prisma.benchmarkSnapshot.findFirst({
    where: { metricCode: 'BUR_ECONOMIC_IMPACT', period: '2024-FY' },
  })

  const delegateNights = await prisma.benchmarkSnapshot.findFirst({
    where: { metricCode: 'BUR_DELEGATE_NIGHTS', period: '2024-FY' },
  })

  const totalOrgs = await prisma.organisation.count({ where: { isApproved: true } })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Industry Overview — 2024-FY</h1>
        <p className="text-gray-500 text-sm mt-1">National cross-pillar benchmarks · Government view · Data anonymised and aggregated</p>
      </div>

      {/* National KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="text-3xl mb-2">🏢</div>
          <div className="text-3xl font-black" style={{ color: '#1E3A5F' }}>{totalOrgs}</div>
          <div className="text-xs text-gray-400 mt-1">Participating Orgs</div>
        </div>
        {economicImpact && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-3xl font-black" style={{ color: '#00A99D' }}>{formatValue(economicImpact.avgValue, 'IMPACT')}</div>
            <div className="text-xs text-gray-400 mt-1">Avg Economic Impact</div>
          </div>
        )}
        {delegateNights && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-2">🌙</div>
            <div className="text-3xl font-black" style={{ color: '#8B5CF6' }}>{formatValue(delegateNights.avgValue, 'NIGHTS')}</div>
            <div className="text-xs text-gray-400 mt-1">Avg Delegate Nights</div>
          </div>
        )}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-3xl font-black" style={{ color: '#F97316' }}>4</div>
          <div className="text-xs text-gray-400 mt-1">Industry Pillars</div>
        </div>
      </div>

      {/* Pillar deep dives */}
      <div className="space-y-6">
        {overview.map(({ pillar, orgCount, submissionCount, snapshots }) => (
          <div key={pillar} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center gap-4" style={{ backgroundColor: PILLAR_COLORS[pillar] + '10' }}>
              <span className="text-3xl">{PILLAR_ICONS[pillar]}</span>
              <div className="flex-1">
                <h2 className="font-bold text-lg" style={{ color: '#1E3A5F' }}>{pillar.charAt(0) + pillar.slice(1).toLowerCase()}s</h2>
                <p className="text-sm text-gray-500">{orgCount} approved organisations · {submissionCount} processed submissions</p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: PILLAR_COLORS[pillar] }}>{pillar}</span>
            </div>
            {snapshots.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No benchmarks available yet</div>
            ) : (
              <div className="grid grid-cols-3 gap-0 divide-x divide-y">
                {snapshots.map(s => (
                  <div key={s.id} className="p-5">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.metricCode.split('_').slice(1).join(' ')}</div>
                    <div className="text-2xl font-black mb-1" style={{ color: PILLAR_COLORS[pillar] }}>{formatValue(s.avgValue, s.metricCode)}</div>
                    <div className="text-xs text-gray-400">industry avg · n={s.sampleSize}</div>
                    <div className="flex gap-2 mt-2 text-xs text-gray-400">
                      <span>P25: {formatValue(s.p25Value || 0, s.metricCode)}</span>
                      <span>·</span>
                      <span>P75: {formatValue(s.p75Value || 0, s.metricCode)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 text-center">
        🔒 All data is aggregated and anonymised. Individual organisations are never identifiable. Benchmarks published with minimum 5 contributors.
      </div>
    </div>
  )
}
