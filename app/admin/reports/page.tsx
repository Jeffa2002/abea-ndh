import { prisma } from '@/lib/prisma'
import { PILLAR_COLORS } from '@/lib/brand'
import { aggregateMetricRows, formatReportValue } from '@/lib/reporting'
import type { Pillar } from '@prisma/client'

export const dynamic = 'force-dynamic'

const PILLARS: Pillar[] = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU']

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const period = one(params.period)
  const pillarParam = one(params.pillar)
  const pillar = PILLARS.includes(pillarParam as Pillar) ? pillarParam as Pillar : undefined
  const region = one(params.region)
  const tier = one(params.tier)
  const metric = one(params.metric)

  const [periodsRaw, orgs] = await Promise.all([
    prisma.dataSubmission.findMany({
      where: { status: 'PROCESSED' },
      distinct: ['period'],
      select: { period: true },
      orderBy: { period: 'desc' },
    }),
    prisma.organisation.findMany({
      where: { isApproved: true },
      select: { region: true, tier: true },
    }),
  ])

  const metricValues = await prisma.metricValue.findMany({
    where: {
      metric: metric ? { code: { contains: metric, mode: 'insensitive' } } : undefined,
      submission: {
        status: 'PROCESSED',
        period: period || undefined,
        pillar: pillar || undefined,
        org: {
          region: region || undefined,
          tier: tier || undefined,
        },
      },
    },
    include: {
      metric: true,
      submission: { include: { org: true } },
    },
    orderBy: [{ period: 'desc' }, { metric: { code: 'asc' } }],
  })

  const rows = aggregateMetricRows(metricValues)
  const periods = periodsRaw.map(item => item.period)
  const regions = [...new Set(orgs.map(org => org.region).filter(Boolean))].sort() as string[]
  const tiers = [...new Set(orgs.map(org => org.tier).filter(Boolean))].sort() as string[]
  const totalSamples = rows.reduce((sum, row) => sum + row.sampleSize, 0)
  const exportParams = new URLSearchParams()
  if (period) exportParams.set('period', period)
  if (pillar) exportParams.set('pillar', pillar)
  if (region) exportParams.set('region', region)
  if (tier) exportParams.set('tier', tier)
  if (metric) exportParams.set('metric', metric)

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Report Builder</h1>
          <p className="max-w-3xl text-sm leading-6 text-gray-500">
            Build governed aggregate extracts from processed data only. Filters map directly to the reporting lake dimensions used in government and board reports.
          </p>
        </div>
        <a
          href={`/api/admin/reports/export?${exportParams.toString()}`}
          className="rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: '#052460' }}
        >
          Export aggregate CSV
        </a>
      </div>

      <form className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-6">
        <label className="text-xs font-semibold uppercase text-gray-500">
          Period
          <select name="period" defaultValue={period || ''} className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-700">
            <option value="">All periods</option>
            {periods.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase text-gray-500">
          Pillar
          <select name="pillar" defaultValue={pillar || ''} className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-700">
            <option value="">All pillars</option>
            {PILLARS.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase text-gray-500">
          Region
          <select name="region" defaultValue={region || ''} className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-700">
            <option value="">All regions</option>
            {regions.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase text-gray-500">
          Tier
          <select name="tier" defaultValue={tier || ''} className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-700">
            <option value="">All tiers</option>
            {tiers.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase text-gray-500">
          Metric code
          <input name="metric" defaultValue={metric || ''} placeholder="e.g. SPEND" className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-700" />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="w-full rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: '#F99F38' }}>
            Run
          </button>
          <a href="/admin/reports" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-500">Reset</a>
        </div>
      </form>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Aggregate rows', value: rows.length },
          { label: 'Sample rows', value: totalSamples },
          { label: 'Periods', value: new Set(rows.map(row => row.period)).size },
          { label: 'Metrics', value: new Set(rows.map(row => row.metricCode)).size },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{item.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: '#052460' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Metric</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Period</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Pillar</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">n</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Avg</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Total</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Dimensions</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 120).map(row => (
              <tr key={`${row.period}-${row.pillar}-${row.metricCode}`} className="border-b last:border-0">
                <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                  {row.metricLabel}
                  <div className="text-xs font-normal text-gray-400">{row.metricCode}</div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{row.period}</td>
                <td className="px-5 py-3">
                  <span className="rounded px-2 py-1 text-xs font-bold text-white" style={{ backgroundColor: PILLAR_COLORS[row.pillar] }}>{row.pillar}</span>
                </td>
                <td className="px-5 py-3 text-right text-sm text-gray-600">{row.sampleSize}</td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-gray-900">{formatReportValue(row.avgValue, row.unit)}</td>
                <td className="px-5 py-3 text-right text-sm text-gray-600">{formatReportValue(row.totalValue, row.unit)}</td>
                <td className="px-5 py-3 text-xs leading-5 text-gray-500">
                  Regions: {row.regions.join(', ') || '—'}<br />
                  Tiers: {row.tiers.join(', ') || '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">No processed metrics match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
