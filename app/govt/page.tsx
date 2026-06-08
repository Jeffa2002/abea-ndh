import { prisma } from '@/lib/prisma'
import { INPUT_CATEGORY_CAVEAT, METHODOLOGY_PRINCIPLES } from '@/lib/inputCategories'
import { PillarCharts } from './PillarCharts'

export const dynamic = 'force-dynamic'

export default async function GovtPage() {
  const pillars = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU'] as const

  const overview = await Promise.all(
    pillars.map(async (pillar) => {
      const coreMetrics = await prisma.metricDefinition.findMany({
        where: { pillar, isCore: true },
        select: { code: true },
      })
      const snapshots = await prisma.benchmarkSnapshot.findMany({
        where: {
          pillar,
          period: '2024-FY',
          metricCode: { in: coreMetrics.map(metric => metric.code) },
        },
        orderBy: { metricCode: 'asc' },
      })
      const orgCount = await prisma.organisation.count({ where: { pillar, isApproved: true } })
      return { pillar, orgCount, snapshots }
    })
  )

  const totalOrgs = await prisma.organisation.count({ where: { isApproved: true } })
  const totalSubmissions = await prisma.dataSubmission.count({ where: { status: 'PROCESSED' } })
  const metricsTracked = overview.reduce((sum, { snapshots }) => sum + snapshots.length, 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#052460' }}>Industry Overview — 2024-FY</h1>
        <p className="text-gray-500 text-sm mt-1">
          National cross-pillar benchmarks · Government view · Data anonymised and aggregated
        </p>
      </div>

      <PillarCharts
        overview={overview}
        totalOrgs={totalOrgs}
        totalSubmissions={totalSubmissions}
        metricsTracked={metricsTracked}
      />

      <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase text-blue-700">Methodology note</p>
          <h2 className="mt-1 text-lg font-bold" style={{ color: '#052460' }}>
            Benchmarks use standardised pillar definitions and aggregated member submissions.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {METHODOLOGY_PRINCIPLES.map((principle) => (
            <div key={principle.title} className="rounded-xl bg-blue-50 p-4">
              <div className="text-sm font-semibold text-blue-900">{principle.title}</div>
              <p className="mt-2 text-xs leading-5 text-blue-700">{principle.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs italic text-gray-500">{INPUT_CATEGORY_CAVEAT}</p>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 text-center">
        🔒 All data is aggregated and anonymised. Individual organisations are never identifiable.
        Benchmarks published with minimum 5 contributors.
      </div>
    </div>
  )
}
