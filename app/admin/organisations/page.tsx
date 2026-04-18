'use client'
import { useEffect, useState } from 'react'

const PILLAR_COLORS: Record<string, string> = {
  VENUE: '#3B82F6', ORGANISER: '#00A99D', SUPPLIER: '#8B5CF6', BUREAU: '#F97316'
}

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/organisations').then(r => r.json()).then(setOrgs).finally(() => setLoading(false))
  }, [])

  async function toggleApproval(id: string, current: boolean) {
    await fetch('/api/admin/organisations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isApproved: !current }),
    })
    setOrgs(orgs.map(o => o.id === id ? { ...o, isApproved: !current } : o))
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>Organisations</h1>
      <p className="text-gray-500 text-sm mb-8">Manage registered organisations and approvals</p>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Organisation</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Pillar</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Region</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Tier</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Users</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Submissions</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Status</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org, i) => (
                <tr key={org.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm text-gray-900">{org.name}</div>
                    <div className="text-xs text-gray-400">{org.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-bold text-white rounded" style={{ backgroundColor: PILLAR_COLORS[org.pillar] }}>{org.pillar}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{org.region || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{org.tier || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{org._count.users}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{org._count.submissions}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${org.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {org.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleApproval(org.id, org.isApproved)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors"
                      style={org.isApproved
                        ? { borderColor: '#FCA5A5', color: '#DC2626', backgroundColor: '#FEF2F2' }
                        : { borderColor: '#6EE7B7', color: '#065F46', backgroundColor: '#ECFDF5' }}>
                      {org.isApproved ? 'Revoke' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
