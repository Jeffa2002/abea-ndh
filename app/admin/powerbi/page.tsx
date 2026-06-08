import { prisma } from '@/lib/prisma'
import { REPORTING_MIN_SAMPLE_SIZE } from '@/lib/privacy'

export const dynamic = 'force-dynamic'

export default async function PowerBiPage() {
  const [metricRows, aggregatePeriods, importBatches] = await Promise.all([
    prisma.metricValue.count({
      where: {
        submission: {
          status: 'PROCESSED',
          OR: [{ importBatchId: null }, { importBatch: { excludeFromReporting: false } }],
        },
      },
    }),
    prisma.dataSubmission.findMany({
      where: {
        status: 'PROCESSED',
        OR: [{ importBatchId: null }, { importBatch: { excludeFromReporting: false } }],
      },
      distinct: ['period'],
      select: { period: true },
      orderBy: { period: 'desc' },
    }),
    prisma.importBatch.count(),
  ])
  const tokenConfigured = Boolean(process.env.POWERBI_FEED_TOKEN)

  const tables = [
    {
      name: 'metric_values',
      url: '/api/powerbi/lake?table=metric_values',
      purpose: 'Long-format fact table for Power BI visuals and DAX measures.',
    },
    {
      name: 'aggregates',
      url: '/api/powerbi/lake?table=aggregates',
      purpose: 'Pre-aggregated metrics by period, pillar, and metric code.',
    },
    {
      name: 'submissions',
      url: '/api/powerbi/lake?table=submissions',
      purpose: 'Submission-level metadata, review dates, organisation dimensions, and import references.',
    },
    {
      name: 'organisations',
      url: '/api/powerbi/lake?table=organisations',
      purpose: 'Approved organisation dimension table.',
    },
    {
      name: 'import_batches',
      url: '/api/powerbi/lake?table=import_batches',
      purpose: 'Import governance and reporting-exclusion status.',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Power BI Feed</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          Stable JSON feed for Power BI, designed around lake-shaped fact and dimension tables. For scheduled refresh, set `POWERBI_FEED_TOKEN` in production and use an Authorization bearer token from Power BI or a gateway.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        {[
          { label: 'Metric fact rows', value: metricRows, note: 'Processed, non-excluded rows' },
          { label: 'Periods available', value: aggregatePeriods.length, note: aggregatePeriods.map(item => item.period).join(', ') || 'None' },
          { label: 'Import batches', value: importBatches, note: 'Governance records available' },
          { label: 'Bearer token', value: tokenConfigured ? 'Set' : 'Not set', note: tokenConfigured ? 'Ready for scheduled refresh' : 'Admin session only until configured' },
          { label: 'Privacy threshold', value: `n=${REPORTING_MIN_SAMPLE_SIZE}`, note: 'Aggregate suppression threshold' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{item.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: '#052460' }}>{item.value}</div>
            <div className="mt-2 text-xs text-gray-500">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
        Power BI can connect using the Web connector to each endpoint below. The first production version should use bearer-token authentication and scheduled refresh. A later version can push directly into a Power BI semantic model using Microsoft&apos;s REST API once ABEA supplies the workspace, tenant/app registration, and dataset ownership model.
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Table</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Endpoint</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Use</th>
            </tr>
          </thead>
          <tbody>
            {tables.map(table => (
              <tr key={table.name} className="border-b last:border-0">
                <td className="px-5 py-4 text-sm font-semibold text-gray-900">{table.name}</td>
                <td className="px-5 py-4 font-mono text-xs text-gray-600">{table.url}</td>
                <td className="px-5 py-4 text-sm leading-6 text-gray-600">{table.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-900">Suggested Power BI Model</h2>
        <div className="grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 md:grid-cols-3">
          <div><span className="font-semibold text-gray-900">Fact table:</span> `metric_values` for all measures, trends, and economic impact calculations.</div>
          <div><span className="font-semibold text-gray-900">Dimensions:</span> `organisations`, period, pillar, metric code, region, tier, cohort, event type, capacity band, and program.</div>
          <div><span className="font-semibold text-gray-900">Governance:</span> `import_batches` to explain inclusion/exclusion and source-file quality.</div>
        </div>
      </div>
    </div>
  )
}
