// @ts-nocheck
import { prisma } from '@/lib/prisma'
import { PillarCharts } from './PillarCharts'

export default async function GovtPage() {
  const pillars = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU'] as const

  const overview = await Promise.all(
    pillars.map(async (pillar) => {
      const snapshots = await prisma.benchmarkSnapshot.findMany({
        where: { pillar, period: '2024-FY' },
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
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Industry Overview — 2024-FY</h1>
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

      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-400 text-center">
        🔒 All data is aggregated and anonymised. Individual organisations are never identifiable.
        Benchmarks published with minimum 5 contributors.
      </div>
    </div>
  )
}
