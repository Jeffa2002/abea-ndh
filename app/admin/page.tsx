import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const PILLAR_COLORS: Record<string, string> = {
  VENUE: '#3B82F6', ORGANISER: '#00A99D', SUPPLIER: '#8B5CF6', BUREAU: '#F97316'
}

export default async function AdminPage() {
  const [totalOrgs, byPillar, totalSubmissions, pendingApprovals, totalSnapshots, recentSubmissions] = await Promise.all([
    prisma.organisation.count(),
    prisma.organisation.groupBy({ by: ['pillar'], _count: { id: true } }),
    prisma.dataSubmission.count(),
    prisma.organisation.count({ where: { isApproved: false } }),
    prisma.benchmarkSnapshot.count(),
    prisma.dataSubmission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { org: true },
    }),
  ])

  const pillarMap = Object.fromEntries(byPillar.map(p => [p.pillar, p._count.id]))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>Admin Overview</h1>
      <p className="text-gray-500 text-sm mb-8">National Data Hub — control panel</p>

      {pendingApprovals > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
          <span className="text-yellow-800 text-sm font-medium">⚠️ {pendingApprovals} organisation{pendingApprovals > 1 ? 's' : ''} pending approval</span>
          <Link href="/admin/organisations" className="text-yellow-700 font-bold text-sm hover:underline">Review →</Link>
        </div>
      )}

      {/* Pillar cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU'].map(pillar => (
          <div key={pillar} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-xs font-bold mb-2 px-2 py-1 rounded-full inline-block text-white" style={{ backgroundColor: PILLAR_COLORS[pillar] }}>{pillar}</div>
            <div className="text-3xl font-black mt-2" style={{ color: '#1E3A5F' }}>{pillarMap[pillar] || 0}</div>
            <div className="text-xs text-gray-400">organisations</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Total Submissions</div>
          <div className="text-3xl font-black" style={{ color: '#1E3A5F' }}>{totalSubmissions}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Benchmark Snapshots</div>
          <div className="text-3xl font-black" style={{ color: '#00A99D' }}>{totalSnapshots}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Total Organisations</div>
          <div className="text-3xl font-black" style={{ color: '#8B5CF6' }}>{totalOrgs}</div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Submissions</h2>
          <Link href="/admin/submissions" className="text-sm font-semibold" style={{ color: '#00A99D' }}>View all →</Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Organisation</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Pillar</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Period</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentSubmissions.map(s => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.org.name}</td>
                <td className="px-6 py-3"><span className="px-2 py-1 text-xs font-bold text-white rounded" style={{ backgroundColor: PILLAR_COLORS[s.pillar] }}>{s.pillar}</span></td>
                <td className="px-6 py-3 text-sm text-gray-600">{s.period}</td>
                <td className="px-6 py-3"><span className={`px-2 py-1 text-xs font-bold rounded ${s.status === 'PROCESSED' ? 'bg-green-100 text-green-700' : s.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{s.status}</span></td>
                <td className="px-6 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString('en-AU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
