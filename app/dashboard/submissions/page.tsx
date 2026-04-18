import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  PROCESSED: 'bg-green-100 text-green-700',
  ERROR: 'bg-red-100 text-red-700',
}

export default async function SubmissionsPage() {
  const session = await getSession()
  if (!session || !session.orgId) redirect('/login')

  const submissions = await prisma.dataSubmission.findMany({
    where: { orgId: session.orgId },
    include: { _count: { select: { metrics: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>My Submissions</h1>
      <p className="text-gray-500 text-sm mb-8">All data submissions from your organisation</p>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-bold text-lg mb-2" style={{ color: '#1E3A5F' }}>No submissions yet</h3>
          <a href="/dashboard/submit" className="inline-block mt-4 px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: '#00A99D' }}>
            Submit Your First Dataset
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ backgroundColor: '#F8FAFC' }}>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Period</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Metrics</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Processed</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr key={s.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-6 py-4 font-semibold text-sm" style={{ color: '#1E3A5F' }}>{s.period}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[s.status] || ''}`}>{s.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s._count.metrics} metrics</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString('en-AU')}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.processedAt ? new Date(s.processedAt).toLocaleDateString('en-AU') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
