import { prisma } from '@/lib/prisma'
import { PILLAR_COLORS } from '@/lib/brand'
import { ReviewActions } from './ReviewActions'

export const dynamic = 'force-dynamic'
const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600', SUBMITTED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700', PROCESSED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700', ERROR: 'bg-red-100 text-red-700',
}

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.dataSubmission.findMany({
    include: {
      org: true,
      _count: { select: { metrics: true } },
      auditEvents: { orderBy: { createdAt: 'desc' }, take: 4 },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  const totalMetrics = submissions.reduce((sum, submission) => sum + submission._count.metrics, 0)
  const submittedCount = submissions.filter(submission => submission.status === 'SUBMITTED').length
  const processedCount = submissions.filter(submission => submission.status === 'PROCESSED').length

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>All Submissions</h1>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-gray-500 text-sm">Showing last 100 submissions across all organisations</p>
        <a
          href="/api/admin/submissions/export"
          className="rounded-lg px-4 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: '#052460' }}
        >
          Export reviewed CSV
        </a>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Submissions shown', value: submissions.length },
          { label: 'Metrics captured', value: totalMetrics },
          { label: 'Awaiting review', value: submittedCount },
          { label: 'Processed', value: processedCount },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{item.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: '#052460' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
        CSV and manual submissions validate metric codes, numeric values, percent bounds, duplicates, and period mismatches before records are saved. Reviewed submissions now keep an event trail so data-lake exports can show who approved or rejected records, when, and why.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Organisation</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Pillar</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Period</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Metrics</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Submitted</th>
              <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Review</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, i) => (
              <tr key={s.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{s.org.name}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-bold text-white rounded" style={{ backgroundColor: PILLAR_COLORS[s.pillar] }}>{s.pillar}</span></td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.period}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{s._count.metrics}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-bold rounded ${STATUS_STYLES[s.status]}`}>{s.status}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString('en-AU')}</td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {s.reviewedAt && (
                      <div className="text-xs leading-5 text-gray-500">
                        Reviewed {new Date(s.reviewedAt).toLocaleDateString('en-AU')}
                        {s.reviewNote ? <div className="mt-1 italic text-gray-400">{s.reviewNote}</div> : null}
                      </div>
                    )}
                    {s.auditEvents.length > 0 && (
                      <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                        <div className="mb-1 text-[10px] font-bold uppercase text-gray-400">Timeline</div>
                        <div className="space-y-1">
                          {s.auditEvents.map(event => (
                            <div key={event.id} className="text-[11px] leading-4 text-gray-500">
                              <span className="font-semibold text-gray-700">{event.action}</span>
                              {' · '}
                              {new Date(event.createdAt).toLocaleDateString('en-AU')}
                              {event.note ? <div className="text-gray-400">{event.note}</div> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <ReviewActions submissionId={s.id} status={s.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
