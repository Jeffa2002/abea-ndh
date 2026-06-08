import { prisma } from '@/lib/prisma'
import { INPUT_CATEGORY_CAVEAT, METHODOLOGY_PRINCIPLES, METHODOLOGY_UPDATED_AT, METHODOLOGY_VERSION } from '@/lib/inputCategories'
import { PillarCharts } from './PillarCharts'
import { aggregateMetricRows, formatReportValue } from '@/lib/reporting'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function GovtPage({ searchParams }: PageProps) {
  const pillars = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU'] as const
  const params = await searchParams
  const requestedPeriod = one(params.period)
  const availablePeriods = await prisma.benchmarkSnapshot.findMany({
    distinct: ['period'],
    select: { period: true },
    orderBy: { period: 'desc' },
  })
  const selectedPeriod = requestedPeriod || availablePeriods[0]?.period || '2024-FY'

  const overview = await Promise.all(
    pillars.map(async (pillar) => {
      const coreMetrics = await prisma.metricDefinition.findMany({
        where: { pillar, isCore: true },
        select: { code: true },
      })
      const snapshots = await prisma.benchmarkSnapshot.findMany({
        where: {
          pillar,
          period: selectedPeriod,
          metricCode: { in: coreMetrics.map(metric => metric.code) },
        },
        orderBy: { metricCode: 'asc' },
      })
      const orgCount = await prisma.organisation.count({ where: { pillar, isApproved: true } })
      return { pillar, orgCount, snapshots }
    })
  )

  const totalOrgs = await prisma.organisation.count({ where: { isApproved: true } })
  const reportableWhere = {
    status: 'PROCESSED' as const,
    OR: [{ importBatchId: null }, { importBatch: { excludeFromReporting: false } }],
  }
  const totalSubmissions = await prisma.dataSubmission.count({ where: reportableWhere })
  const selectedSubmissions = await prisma.dataSubmission.count({ where: { ...reportableWhere, period: selectedPeriod } })
  const metricsTracked = overview.reduce((sum, { snapshots }) => sum + snapshots.length, 0)
  const metricRows = await prisma.metricValue.count({ where: { submission: { ...reportableWhere, period: selectedPeriod } } })
  const benchmarkSampleTotal = overview.reduce(
    (sum, { snapshots }) => sum + snapshots.reduce((inner, snapshot) => inner + snapshot.sampleSize, 0),
    0,
  )
  const latestBenchmarkDate = overview
    .flatMap(item => item.snapshots)
    .map(snapshot => snapshot.createdAt)
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const trendSubmissions = await prisma.dataSubmission.groupBy({
    by: ['period'],
    where: reportableWhere,
    _count: { id: true },
    orderBy: { period: 'desc' },
  })
  const trendMetricValues = await prisma.metricValue.groupBy({
    by: ['period'],
    where: { submission: reportableWhere },
    _count: { id: true },
    orderBy: { period: 'desc' },
  })
  const trendMetricByPeriod = Object.fromEntries(trendMetricValues.map(item => [item.period, item._count.id]))
  const economicValues = await prisma.metricValue.findMany({
    where: {
      submission: { ...reportableWhere, period: selectedPeriod },
      metric: { code: { in: ['BUR_ECONOMIC_IMPACT', 'ORG_DELEGATE_DIRECT_EVENT_SPEND', 'ORG_INDIRECT_VISITOR_SPEND', 'ORG_DIRECT_VIC_SPEND'] } },
    },
    include: {
      metric: true,
      submission: { include: { org: true } },
    },
  })
  const economicRows = aggregateMetricRows(economicValues)
  const totalEconomicSignal = economicRows.reduce((sum, row) => sum + row.totalValue, 0)

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#052460' }}>Industry Overview — {selectedPeriod}</h1>
          <p className="text-gray-500 text-sm mt-1">
            National cross-pillar benchmarks · Government view · Data anonymised and aggregated
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {availablePeriods.map(item => (
            <a
              key={item.period}
              href={`/govt?period=${item.period}`}
              className={`rounded-lg px-3 py-2 text-xs font-bold ${item.period === selectedPeriod ? 'text-white' : 'border border-gray-200 bg-white text-gray-500'}`}
              style={item.period === selectedPeriod ? { backgroundColor: '#052460' } : undefined}
            >
              {item.period}
            </a>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        {[
          { label: 'Approved organisations', value: totalOrgs, note: 'Across all pillars' },
          { label: 'Processed submissions', value: selectedSubmissions, note: `${totalSubmissions} all-time processed` },
          { label: 'Metric fact rows', value: metricRows, note: 'Processed rows in this period' },
          { label: 'Benchmark sample total', value: benchmarkSampleTotal, note: 'Cumulative sample observations' },
          { label: 'Economic signal', value: formatReportValue(totalEconomicSignal, 'AUD'), note: 'Tracked impact/spend rows' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
            <div className="text-xs text-gray-400">{item.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: '#052460' }}>{item.value}</div>
            <div className="mt-2 text-xs text-gray-400">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-blue-700">Report basis</p>
            <h2 className="mt-1 text-lg font-bold" style={{ color: '#052460' }}>Government reporting metadata</h2>
          </div>
          <div className="text-xs text-gray-500">
            Methodology {METHODOLOGY_VERSION} · Updated {METHODOLOGY_UPDATED_AT} · Benchmark vintage {latestBenchmarkDate ? latestBenchmarkDate.toLocaleDateString('en-AU') : '—'}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
            Only admin-processed submissions feed this view. Submitted, rejected, and error records are retained in the lake for governance but excluded from report outputs.
          </div>
          <div className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
            Reports carry period, methodology version, benchmark vintage, sample sizes, and anonymisation caveats so extracts remain auditable over time.
          </div>
          <div className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
            Economic-impact signals combine available bureau and organiser spend/impact metrics. Final multiplier treatment remains subject to government input.
          </div>
        </div>
      </div>

      <PillarCharts
        overview={overview}
        totalOrgs={totalOrgs}
        totalSubmissions={totalSubmissions}
        metricsTracked={metricsTracked}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-bold text-gray-900">Period Trend</h2>
            <p className="mt-1 text-xs text-gray-500">Processed submissions and metric fact rows by reporting period.</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Period</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Submissions</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Metric rows</th>
              </tr>
            </thead>
            <tbody>
              {trendSubmissions.map(item => (
                <tr key={item.period} className="border-b last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">{item.period}</td>
                  <td className="px-5 py-3 text-right text-sm text-gray-600">{item._count.id}</td>
                  <td className="px-5 py-3 text-right text-sm text-gray-600">{trendMetricByPeriod[item.period] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-bold text-gray-900">Economic Impact Inputs</h2>
            <p className="mt-1 text-xs text-gray-500">Tracked impact and spend signals for the selected period.</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Metric</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">n</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Avg</th>
              </tr>
            </thead>
            <tbody>
              {economicRows.map(row => (
                <tr key={`${row.period}-${row.metricCode}`} className="border-b last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                    {row.metricLabel}
                    <div className="text-xs font-normal text-gray-400">{row.metricCode}</div>
                  </td>
                  <td className="px-5 py-3 text-right text-sm text-gray-600">{row.sampleSize}</td>
                  <td className="px-5 py-3 text-right text-sm text-gray-600">{formatReportValue(row.totalValue, row.unit)}</td>
                  <td className="px-5 py-3 text-right text-sm text-gray-600">{formatReportValue(row.avgValue, row.unit)}</td>
                </tr>
              ))}
              {economicRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">No economic impact inputs are available for this period yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase text-blue-700">Methodology note · {METHODOLOGY_VERSION} · {METHODOLOGY_UPDATED_AT}</p>
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
