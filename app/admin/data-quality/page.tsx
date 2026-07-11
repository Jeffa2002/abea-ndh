import { prisma } from '@/lib/prisma'
import { PILLAR_COLORS } from '@/lib/brand'

export const dynamic = 'force-dynamic'

type PillarName = keyof typeof PILLAR_COLORS

type SubmissionWithOrgAndMetricCount = {
  id: string
  org: { name: string }
  period: string
  status: string
  pillar: PillarName
  _count: { metrics: number }
}

type ApprovedOrgWithLatestSubmission = {
  id: string
  name: string
  pillar: PillarName
  submissions: { period: string; createdAt: Date | null }[]
}

type CoreMetricPillar = { pillar: PillarName }

type ImportBatchSummary = {
  id: string
  filename: string
  status: string
  period: string | null
  rowCount: number
  acceptedRows: number
  rejectedRows: number
  excludeFromReporting: boolean
  createdAt: Date
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-AU').format(value)
}

function formatDate(value: Date | null | undefined) {
  return value ? new Date(value).toLocaleDateString('en-AU') : '—'
}

export default async function DataQualityPage() {
  const [submissions, approvedOrgs, coreMetrics, metricRows, auditEvents, importBatches] = await Promise.all([
    prisma.dataSubmission.findMany({
      include: { org: true, _count: { select: { metrics: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organisation.findMany({
      where: { isApproved: true },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { _count: { select: { metrics: true } } },
        },
      },
    }),
    prisma.metricDefinition.findMany({ where: { isCore: true }, select: { pillar: true } }),
    prisma.metricValue.count(),
    prisma.submissionAuditEvent.count(),
    prisma.importBatch.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]) as [
    SubmissionWithOrgAndMetricCount[],
    ApprovedOrgWithLatestSubmission[],
    CoreMetricPillar[],
    number,
    number,
    ImportBatchSummary[],
  ]

  const periods = [...new Set(submissions.map(submission => submission.period))].sort().reverse()
  const latestPeriod = periods[0]
  const coreByPillar = coreMetrics.reduce<Record<string, number>>((acc, metric) => {
    acc[metric.pillar] = (acc[metric.pillar] || 0) + 1
    return acc
  }, {})
  const processedLatest = submissions.filter(submission => submission.status === 'PROCESSED' && submission.period === latestPeriod)
  const submittedAwaitingReview = submissions.filter(submission => submission.status === 'SUBMITTED')
  const rejectedRecords = submissions.filter(submission => submission.status === 'REJECTED' || submission.status === 'ERROR')
  const incompleteRecords = submissions.filter(submission => submission._count.metrics < (coreByPillar[submission.pillar] || 0))
  const staleOrgs = latestPeriod
    ? approvedOrgs.filter(org => org.submissions[0]?.period !== latestPeriod)
    : approvedOrgs
  const averageMetrics = submissions.length > 0 ? Math.round(metricRows / submissions.length) : 0

  const summary = [
    { label: 'Lake fact rows', value: formatNumber(metricRows), note: 'Metric-value rows ready for long-format analytics' },
    { label: 'Audit events', value: formatNumber(auditEvents), note: 'Submission lifecycle records captured' },
    { label: 'Import batches', value: formatNumber(importBatches.length), note: 'Recent CSV ingestion files tracked' },
    { label: 'Reporting periods', value: formatNumber(periods.length), note: latestPeriod ? `Latest period: ${latestPeriod}` : 'No periods yet' },
    { label: 'Processed latest records', value: formatNumber(processedLatest.length), note: `Approved records feeding ${latestPeriod || 'the latest period'} reports` },
    { label: 'Avg metrics / submission', value: String(averageMetrics), note: 'Completeness signal across all ingested records' },
  ]

  const healthChecks = [
    {
      label: 'Awaiting admin review',
      value: submittedAwaitingReview.length,
      tone: submittedAwaitingReview.length > 0 ? 'warning' : 'good',
      detail: 'Records are stored but excluded from official reports until processed.',
    },
    {
      label: 'Incomplete core metric sets',
      value: incompleteRecords.length,
      tone: incompleteRecords.length > 0 ? 'warning' : 'good',
      detail: 'Useful for follow-up before benchmark recalculation.',
    },
    {
      label: 'Organisations stale for latest period',
      value: staleOrgs.length,
      tone: staleOrgs.length > 0 ? 'warning' : 'good',
      detail: latestPeriod ? `Approved organisations without a ${latestPeriod} submission.` : 'No latest period exists yet.',
    },
    {
      label: 'Rejected or error records',
      value: rejectedRecords.length,
      tone: rejectedRecords.length > 0 ? 'danger' : 'good',
      detail: 'These are retained for governance but excluded from benchmark outputs.',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Data Quality</h1>
          <p className="max-w-3xl text-sm leading-6 text-gray-500">
            Admin readiness view for a future national reporting lake: ingestion volume, governed review state, completeness, stale contributors, and export paths.
          </p>
        </div>
        <a
          href="/api/admin/submissions/export"
          className="rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: '#052460' }}
        >
          Export lake-ready CSV
        </a>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-6">
        {summary.map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{item.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: '#052460' }}>{item.value}</div>
            <div className="mt-2 text-xs leading-5 text-gray-500">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {healthChecks.map(check => (
          <div key={check.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{check.label}</div>
            <div
              className="mt-2 text-3xl font-black"
              style={{ color: check.tone === 'danger' ? '#EF3D55' : check.tone === 'warning' ? '#F99F38' : '#00A7E2' }}
            >
              {check.value}
            </div>
            <div className="mt-2 text-xs leading-5 text-gray-500">{check.detail}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
        Reporting lake design rule: metric values are exported in long format, keyed by submission, organisation, pillar, period, status, and audit metadata. This keeps future trend reports, state splits, cohort cuts, and government extracts from depending on wide, fragile spreadsheet shapes.
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-bold text-gray-900">Incomplete Submissions</h2>
            <p className="mt-1 text-xs text-gray-500">Records with fewer submitted metrics than their pillar core set.</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Organisation</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Period</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Coverage</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {incompleteRecords.slice(0, 8).map(submission => (
                <tr key={submission.id} className="border-b last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                    {submission.org.name}
                    <div className="mt-1">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: PILLAR_COLORS[submission.pillar] }}>
                        {submission.pillar}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{submission.period}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{submission._count.metrics}/{coreByPillar[submission.pillar] || 0}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{submission.status}</td>
                </tr>
              ))}
              {incompleteRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">No incomplete records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-bold text-gray-900">Latest Period Coverage</h2>
            <p className="mt-1 text-xs text-gray-500">Approved organisations without a processed submission in the latest reporting period.</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Organisation</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Last Period</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Last Submission</th>
              </tr>
            </thead>
            <tbody>
              {staleOrgs.slice(0, 8).map(org => (
                <tr key={org.id} className="border-b last:border-0">
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                    {org.name}
                    <div className="mt-1">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: PILLAR_COLORS[org.pillar] }}>
                        {org.pillar}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{org.submissions[0]?.period || 'No submissions'}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{formatDate(org.submissions[0]?.createdAt)}</td>
                </tr>
              ))}
              {staleOrgs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm text-gray-400">All approved organisations have latest-period data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-bold text-gray-900">Import Governance</h2>
          <p className="mt-1 text-xs text-gray-500">Recent CSV batches with accepted/rejected row counts for operational follow-up.</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">File</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Period</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Rows</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Accepted</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Rejected</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reporting</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {importBatches.map(batch => (
              <tr key={batch.id} className="border-b last:border-0">
                <td className="px-5 py-3 text-sm font-semibold text-gray-900">{batch.filename}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{batch.status}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{batch.period || '—'}</td>
                <td className="px-5 py-3 text-right text-sm text-gray-600">{batch.rowCount}</td>
                <td className="px-5 py-3 text-right text-sm text-gray-600">{batch.acceptedRows}</td>
                <td className="px-5 py-3 text-right text-sm text-gray-600">{batch.rejectedRows}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{batch.excludeFromReporting ? 'Excluded' : 'Included'}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{formatDate(batch.createdAt)}</td>
              </tr>
            ))}
            {importBatches.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No CSV import batches recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-900">Report Design Notes</h2>
        <div className="grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 md:grid-cols-3">
          <div>
            <div className="mb-1 font-semibold text-gray-900">Separate raw from reported</div>
            Store every accepted metric row, but only processed records should feed public, member, or government reports.
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-900">Version the reporting basis</div>
            Every extract should carry period, methodology version, benchmark vintage, sample size, and review state.
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-900">Optimise for longitudinal use</div>
            Keep reports period-aware so later trend, cohort, regional, and pillar comparisons do not need schema rewrites.
          </div>
        </div>
      </div>
    </div>
  )
}
