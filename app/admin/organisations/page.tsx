'use client'
import { useEffect, useState } from 'react'
import { PILLAR_COLORS } from '@/lib/brand'
import type { Pillar } from '@prisma/client'
import { REPORTING_DIMENSIONS } from '@/lib/reportingDimensions'

type AdminOrganisation = {
  id: string
  name: string
  slug: string
  pillar: Pillar
  region: string | null
  tier: string | null
  reportingCohort: string | null
  primaryEventType: string | null
  capacityBand: string | null
  governmentProgram: string | null
  isApproved: boolean
  _count: {
    users: number
    submissions: number
  }
}

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<AdminOrganisation[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/organisations').then(r => r.json()).then(setOrgs).finally(() => setLoading(false))
  }, [])

  async function toggleApproval(id: string, current: boolean) {
    const res = await fetch('/api/admin/organisations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isApproved: !current }),
    })
    if (res.ok) setOrgs(orgs.map(o => o.id === id ? { ...o, isApproved: !current } : o))
  }

  async function updateDimension(id: string, field: keyof Pick<AdminOrganisation, 'region' | 'tier' | 'reportingCohort' | 'primaryEventType' | 'capacityBand' | 'governmentProgram'>, value: string) {
    setSavingId(id)
    const cleanValue = value || null
    const res = await fetch('/api/admin/organisations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: cleanValue }),
    })
    setSavingId(null)
    if (res.ok) setOrgs(orgs.map(o => o.id === id ? { ...o, [field]: cleanValue } : o))
  }

  function dimensionSelect(
    org: AdminOrganisation,
    field: keyof Pick<AdminOrganisation, 'region' | 'tier' | 'reportingCohort' | 'primaryEventType' | 'capacityBand' | 'governmentProgram'>,
    options: readonly string[],
  ) {
    return (
      <select
        value={org[field] || ''}
        disabled={savingId === org.id}
        onChange={event => void updateDimension(org.id, field, event.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700"
      >
        <option value="">—</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Organisations</h1>
      <p className="text-gray-500 text-sm mb-8">Manage registered organisations, approvals, and controlled reporting dimensions</p>

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
                <th className="text-left px-6 py-4 text-xs text-gray-500 font-semibold uppercase">Reporting Dimensions</th>
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
                  <td className="px-6 py-4 min-w-[130px]">{dimensionSelect(org, 'region', REPORTING_DIMENSIONS.regions)}</td>
                  <td className="px-6 py-4 min-w-[130px]">{dimensionSelect(org, 'tier', REPORTING_DIMENSIONS.tiers)}</td>
                  <td className="px-6 py-4 min-w-[260px]">
                    <div className="grid grid-cols-1 gap-2">
                      {dimensionSelect(org, 'reportingCohort', REPORTING_DIMENSIONS.cohorts)}
                      {dimensionSelect(org, 'primaryEventType', REPORTING_DIMENSIONS.eventTypes)}
                      {dimensionSelect(org, 'capacityBand', REPORTING_DIMENSIONS.capacityBands)}
                      {dimensionSelect(org, 'governmentProgram', REPORTING_DIMENSIONS.governmentPrograms)}
                    </div>
                  </td>
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
