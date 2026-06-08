'use client'

import { useEffect, useState } from 'react'

type ImportBatch = {
  id: string
  filename: string
  source: string
  status: string
  period: string | null
  pillar: string | null
  rowCount: number
  acceptedRows: number
  rejectedRows: number
  excludeFromReporting: boolean
  exclusionNote: string | null
  createdAt: string
  validationSummary: unknown
  _count: { submissions: number }
}

export default function AdminImportsPage() {
  const [batches, setBatches] = useState<ImportBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [noteById, setNoteById] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/admin/import-batches')
    const data = await res.json() as ImportBatch[]
    setBatches(data)
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    fetch('/api/admin/import-batches')
      .then(res => res.json() as Promise<ImportBatch[]>)
      .then(data => {
        if (active) setBatches(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function toggleExclude(batch: ImportBatch) {
    setSavingId(batch.id)
    const res = await fetch(`/api/admin/import-batches/${batch.id}/exclude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exclude: !batch.excludeFromReporting,
        note: noteById[batch.id] || (batch.excludeFromReporting ? '' : 'Excluded during admin import review.'),
      }),
    })
    setSavingId(null)
    if (res.ok) void load()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Import Batches</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          Review CSV ingestion batches, validation outcomes, linked submissions, and whether a batch is allowed into official reporting outputs.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
        Excluding a batch keeps the audit trail and linked submissions intact, but removes those rows from report-builder, government, benchmark, and Power BI lake feeds.
      </div>

      {loading ? <div className="text-sm text-gray-400">Loading...</div> : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Batch</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Rows</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Linked</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Validation</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Reporting</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(batch => (
                <tr key={batch.id} className="border-b align-top last:border-0">
                  <td className="px-5 py-4 text-sm">
                    <div className="font-semibold text-gray-900">{batch.filename}</div>
                    <div className="mt-1 text-xs text-gray-400">{batch.source} · {batch.period || 'No period'} · {batch.pillar || 'No pillar'}</div>
                    <div className="mt-1 text-xs text-gray-400">{new Date(batch.createdAt).toLocaleString('en-AU')}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{batch.status}</td>
                  <td className="px-5 py-4 text-right text-sm text-gray-600">
                    {batch.rowCount}
                    <div className="mt-1 text-xs text-gray-400">{batch.acceptedRows} accepted · {batch.rejectedRows} rejected</div>
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-gray-600">{batch._count.submissions}</td>
                  <td className="px-5 py-4 text-xs leading-5 text-gray-500">
                    {batch.validationSummary
                      ? <pre className="max-w-sm whitespace-pre-wrap rounded-lg bg-gray-50 p-2">{JSON.stringify(batch.validationSummary, null, 2).slice(0, 800)}</pre>
                      : 'No validation issues recorded.'}
                  </td>
                  <td className="px-5 py-4 min-w-[260px]">
                    <div className={`mb-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${batch.excludeFromReporting ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {batch.excludeFromReporting ? 'Excluded' : 'Included'}
                    </div>
                    {batch.excludeFromReporting && batch.exclusionNote && (
                      <div className="mb-2 text-xs italic text-gray-400">{batch.exclusionNote}</div>
                    )}
                    {!batch.excludeFromReporting && (
                      <textarea
                        value={noteById[batch.id] || ''}
                        onChange={event => setNoteById({ ...noteById, [batch.id]: event.target.value })}
                        placeholder="Exclusion note"
                        rows={2}
                        className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700"
                      />
                    )}
                    <button
                      type="button"
                      disabled={savingId === batch.id}
                      onClick={() => void toggleExclude(batch)}
                      className="rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                      style={{ backgroundColor: batch.excludeFromReporting ? '#052460' : '#EF3D55' }}
                    >
                      {savingId === batch.id ? 'Saving...' : batch.excludeFromReporting ? 'Include in reporting' : 'Exclude from reporting'}
                    </button>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">No import batches recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
