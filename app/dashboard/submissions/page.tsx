'use client'
// @ts-nocheck
import { useEffect, useState } from 'react'

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  PROCESSED: 'bg-green-100 text-green-700',
  ERROR: 'bg-red-100 text-red-700',
}

interface MetricValue {
  id: string
  value: number
  metric: {
    label: string
    unit: string
    code: string
  }
}

interface Submission {
  id: string
  period: string
  status: string
  createdAt: string
  processedAt: string | null
  metrics: MetricValue[]
}

function formatValue(value: number, unit: string): string {
  if (unit === 'AUD') return `$${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value.toFixed(0)}`
  if (unit === 'percent') return `${value.toFixed(1)}%`
  return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString()
}

function ExpandedMetrics({ metrics }: { metrics: MetricValue[] }) {
  if (!metrics || metrics.length === 0) {
    return <div className="text-sm text-gray-400 italic">No metric values recorded.</div>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
      {metrics.map(mv => (
        <div key={mv.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
          <span className="text-xs text-gray-500 truncate mr-3 flex-1">{mv.metric?.label || mv.metric?.code}</span>
          <span className="text-xs font-semibold text-gray-700 flex-shrink-0">
            {formatValue(mv.value, mv.metric?.unit || '')}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/data/submissions')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load submissions')
        return r.json()
      })
      .then(data => {
        setSubmissions(data)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const toggleRow = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>My Submissions</h1>
        <div className="mt-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>My Submissions</h1>
        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>My Submissions</h1>
      <p className="text-gray-500 text-sm mb-8">All data submissions from your organisation. Click a row to see submitted metric values.</p>

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
                <th className="px-6 py-4 w-8" />
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => {
                const isExpanded = expandedId === s.id
                return (
                  <>
                    <tr
                      key={s.id}
                      onClick={() => toggleRow(s.id)}
                      className={`border-b cursor-pointer select-none transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'} hover:bg-teal-50/40 ${isExpanded ? 'bg-teal-50/60' : ''}`}
                    >
                      <td className="px-6 py-4 font-semibold text-sm" style={{ color: '#1E3A5F' }}>{s.period}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[s.status] || ''}`}>{s.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{s.metrics?.length ?? 0} metrics</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString('en-AU')}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{s.processedAt ? new Date(s.processedAt).toLocaleDateString('en-AU') : '—'}</td>
                      <td className="px-6 py-4 text-gray-400 text-right">
                        <svg
                          width="16" height="16" viewBox="0 0 16 16" fill="none"
                          className={`transition-transform duration-200 inline-block ${isExpanded ? 'rotate-90' : ''}`}
                          style={{ color: isExpanded ? '#00A99D' : undefined }}
                        >
                          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${s.id}-expanded`} className="border-b bg-teal-50/30">
                        <td colSpan={6} className="px-8 py-5">
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-700">Submitted metric values — {s.period}</div>
                          <ExpandedMetrics metrics={s.metrics} />
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
