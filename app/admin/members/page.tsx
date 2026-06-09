'use client'
import { useCallback, useEffect, useState } from 'react'

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type UserRole = 'ADMIN' | 'MEMBER' | 'GOVT_VIEWER'

type Member = {
  id: string
  email: string
  role: UserRole
  approvalStatus: ApprovalStatus
  approvalNote: string | null
  createdAt: string
  org: {
    id: string
    name: string
    pillar: string
    region: string | null
  } | null
}

const STATUS_COLORS: Record<ApprovalStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  MEMBER: 'bg-blue-100 text-blue-800',
  GOVT_VIEWER: 'bg-gray-100 text-gray-700',
}

export default function MembersPage() {
  const [users, setUsers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({})
  const [rejectOpen, setRejectOpen] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('MEMBER')
  const [inviteOrgId, setInviteOrgId] = useState('')
  const [inviteResult, setInviteResult] = useState<{ email: string; password: string } | null>(null)
  const [inviteError, setInviteError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/members')
      const data = await res.json() as { users?: Member[] }
      setUsers(data.users || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch('/api/admin/members')
      .then(res => res.json() as Promise<{ users?: Member[] }>)
      .then(data => setUsers(data.users || []))
      .finally(() => setLoading(false))
  }, [])

  async function approve(id: string) {
    setActionLoading(id + '-approve')
    await fetch(`/api/admin/members/${id}/approve`, { method: 'POST' })
    setActionLoading(null)
    void load()
  }

  async function reject(id: string) {
    setActionLoading(id + '-reject')
    await fetch(`/api/admin/members/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: rejectNote[id] || '' }),
    })
    setActionLoading(null)
    setRejectOpen(null)
    setRejectNote(n => ({ ...n, [id]: '' }))
    void load()
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    setActionLoading('invite')
    setInviteError('')
    setInviteResult(null)
    const res = await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inviteEmail,
        role: inviteRole,
        orgId: inviteRole === 'MEMBER' ? inviteOrgId : undefined,
      }),
    })
    const data = await res.json()
    setActionLoading(null)
    if (!res.ok) {
      setInviteError(data.error || 'Invite failed')
      return
    }
    setInviteResult({ email: data.user.email, password: data.temporaryPassword })
    setInviteEmail('')
    setInviteOrgId('')
    void load()
  }

  const sorted = [...users].sort((a, b) => {
    const order: Record<ApprovalStatus, number> = { PENDING: 0, APPROVED: 1, REJECTED: 2 }
    return (order[a.approvalStatus] ?? 3) - (order[b.approvalStatus] ?? 3)
  })
  const organisations = Array.from(
    new Map(users.filter(user => user.org).map(user => [user.org!.id, user.org!])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Member Management</h1>
      <p className="text-gray-500 text-sm mb-8">Review and approve member registrations</p>

      <form onSubmit={invite} className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-gray-900">Invite Account</h2>
            <p className="text-xs text-gray-500">Creates a temporary password and forces password change on first login.</p>
          </div>
          <button disabled={actionLoading === 'invite'} className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: '#052460' }}>
            {actionLoading === 'invite' ? 'Creating...' : 'Create Invite'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" required placeholder="email@organisation.com.au" className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none" />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value as UserRole)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none">
            <option value="MEMBER">Member</option>
            <option value="GOVT_VIEWER">Government viewer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select value={inviteOrgId} onChange={e => setInviteOrgId(e.target.value)} disabled={inviteRole !== 'MEMBER'} required={inviteRole === 'MEMBER'} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none md:col-span-2">
            <option value="">Select organisation for member account</option>
            {organisations.map(org => (
              <option key={org.id} value={org.id}>{org.name} ({org.pillar})</option>
            ))}
          </select>
        </div>
        {inviteError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{inviteError}</div>}
        {inviteResult && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
            Temporary credentials for <span className="font-semibold">{inviteResult.email}</span>: <span className="font-mono">{inviteResult.password}</span>
          </div>
        )}
      </form>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading members...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <span className="font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
                {users.filter(u => u.approvalStatus === 'PENDING').length} Pending
              </span>
              <span className="font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                {users.filter(u => u.approvalStatus === 'APPROVED').length} Approved
              </span>
              <span className="font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full">
                {users.filter(u => u.approvalStatus === 'REJECTED').length} Rejected
              </span>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Member</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Organisation</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Registered</th>
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(u => {
                const sc = STATUS_COLORS[u.approvalStatus] || STATUS_COLORS.PENDING
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 text-sm">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{u.org?.name || '—'}</div>
                      {u.org?.pillar && (
                        <div className="text-xs text-gray-400">{u.org.pillar} · {u.org.region || '—'}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                      {u.approvalNote && (
                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={u.approvalNote}>
                          Note: {u.approvalNote}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('en-AU')}
                    </td>
                    <td className="px-6 py-4">
                      {u.approvalStatus === 'PENDING' && (
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => approve(u.id)}
                            disabled={actionLoading === u.id + '-approve'}
                            className="px-3 py-1.5 text-xs font-bold text-white rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading === u.id + '-approve' ? '...' : 'Approve'}
                          </button>
                          {rejectOpen === u.id ? (
                            <div className="flex gap-1 items-center">
                              <input
                                type="text"
                                placeholder="Reason (optional)"
                                value={rejectNote[u.id] || ''}
                                onChange={e => setRejectNote(n => ({ ...n, [u.id]: e.target.value }))}
                                className="border border-gray-200 rounded px-2 py-1 text-xs w-36 focus:outline-none"
                              />
                              <button
                                onClick={() => reject(u.id)}
                                disabled={actionLoading === u.id + '-reject'}
                                className="px-3 py-1.5 text-xs font-bold text-white rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50"
                              >
                                {actionLoading === u.id + '-reject' ? '...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setRejectOpen(null)}
                                className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                              >✕</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRejectOpen(u.id)}
                              className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      )}
                      {u.approvalStatus === 'APPROVED' && (
                        <button
                          onClick={() => { setRejectOpen(u.id) }}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          {rejectOpen === u.id ? (
                            <span className="flex gap-1 items-center">
                              <input
                                type="text"
                                placeholder="Reason (optional)"
                                value={rejectNote[u.id] || ''}
                                onChange={e => { e.stopPropagation(); setRejectNote(n => ({ ...n, [u.id]: e.target.value })) }}
                                className="border border-gray-200 rounded px-2 py-1 text-xs w-28 focus:outline-none"
                                onClick={e => e.stopPropagation()}
                              />
                              <span onClick={e => { e.stopPropagation(); reject(u.id) }} className="cursor-pointer text-white bg-red-600 px-2 py-0.5 rounded">Go</span>
                              <span onClick={e => { e.stopPropagation(); setRejectOpen(null) }} className="cursor-pointer text-gray-500 hover:text-gray-700">✕</span>
                            </span>
                          ) : 'Revoke'}
                        </button>
                      )}
                      {u.approvalStatus === 'REJECTED' && (
                        <button
                          onClick={() => approve(u.id)}
                          disabled={actionLoading === u.id + '-approve'}
                          className="px-3 py-1.5 text-xs font-bold text-green-600 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50"
                        >
                          Re-approve
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">No members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
