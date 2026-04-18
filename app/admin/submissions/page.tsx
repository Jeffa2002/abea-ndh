import { prisma } from '@/lib/prisma'

const PILLAR_COLORS: Record<string, string> = {
  VENUE: '#3B82F6', ORGANISER: '#00A99D', SUPPLIER: '#8B5CF6', BUREAU: '#F97316'
}
const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600', SUBMITTED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700', PROCESSED: 'bg-green-100 text-green-700', ERROR: 'bg-red-100 text-red-700',
}

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.dataSubmission.findMany({
    include: { org: true, _count: { select: { metrics: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>All Submissions</h1>
      <p className="text-gray-500 text-sm mb-8">Showing last 100 submissions across all organisations</p>

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
