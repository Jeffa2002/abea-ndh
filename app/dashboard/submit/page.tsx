'use client'
import { useState, useEffect } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { INPUT_CATEGORY_CAVEAT, METHODOLOGY_VERSION, ORGANISER_METRIC_GUIDANCE } from '@/lib/inputCategories'

const PERIODS = ['2024-FY', '2024-H1', '2024-H2', '2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-FY']

type MetricDefinition = {
  code: string
  label: string
  unit: string
  description: string | null
}

type ValidationIssue = {
  row?: number
  metricCode?: string
  field: string
  message: string
}

export default function SubmitPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('2024-FY')
  const [metrics, setMetrics] = useState<MetricDefinition[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [issues, setIssues] = useState<ValidationIssue[]>([])
  const [uploadMode, setUploadMode] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const hasOrganiserInputs = metrics.some(metric => metric.code.startsWith('ORG_'))

  useEffect(() => {
    fetch('/api/data/metrics').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setMetrics(data)
        const init: Record<string, string> = {}
        data.forEach((m: MetricDefinition) => { init[m.code] = '' })
        setValues(init)
      }
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setIssues([])

    const numericValues: Record<string, number> = {}
    for (const [k, v] of Object.entries(values)) {
      if (v !== '') numericValues[k] = parseFloat(v)
    }

    const res = await fetch('/api/data/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, metrics: numericValues }),
    })
    const data = await res.json() as { error?: string; issues?: ValidationIssue[]; submissionId?: string }
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Submission failed')
      setIssues(data.issues || [])
      return
    }
    const count = Object.keys(numericValues).length
    router.push(`/dashboard/submit/confirmation?id=${data.submissionId}&metrics=${count}&period=${encodeURIComponent(period)}`)
  }

  async function handleCSVUpload(e: FormEvent) {
    e.preventDefault()
    if (!csvFile) return
    setLoading(true)
    setError('')
    setIssues([])
    const fd = new FormData()
    fd.append('file', csvFile)
    fd.append('period', period)
    const res = await fetch('/api/data/upload', { method: 'POST', body: fd })
    const data = await res.json() as { error?: string; issues?: ValidationIssue[]; submissionId?: string; recordsProcessed?: number }
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Upload failed')
      setIssues(data.issues || [])
      return
    }
    router.push(`/dashboard/submit/confirmation?id=${data.submissionId || 'csv'}&metrics=${data.recordsProcessed || 0}&period=${encodeURIComponent(period)}`)
  }

  function unitLabel(unit: string) {
    if (unit === 'AUD') return 'AUD $'
    if (unit === 'percent') return '%'
    return unit
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Submit Data</h1>
      <p className="text-gray-500 text-sm mb-8">Submit your organisation&apos;s metrics for a specific period · Methodology {METHODOLOGY_VERSION}</p>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="font-semibold">{error}</div>
          {issues.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs leading-5 text-red-600">
              {issues.slice(0, 6).map((issue, index) => (
                <li key={`${issue.field}-${issue.metricCode || index}`}>
                  {issue.row ? `Row ${issue.row}: ` : ''}
                  {issue.metricCode ? `${issue.metricCode} - ` : ''}
                  {issue.message}
                </li>
              ))}
              {issues.length > 6 && <li>{issues.length - 6} more issue{issues.length === 7 ? '' : 's'} found.</li>}
            </ul>
          )}
        </div>
      )}

      {/* Period selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Reporting Period</label>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map(p => (
            <button key={p} type="button" onClick={() => setPeriod(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={period === p ? { backgroundColor: '#052460', color: 'white', borderColor: '#052460' } : { backgroundColor: 'white', color: '#374151', borderColor: '#E5E7EB' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setUploadMode(false)}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={!uploadMode ? { backgroundColor: '#F99F38', color: 'white', borderColor: '#F99F38' } : { backgroundColor: 'white', color: '#374151', borderColor: '#E5E7EB' }}>
          📝 Manual Entry
        </button>
        <button onClick={() => setUploadMode(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={uploadMode ? { backgroundColor: '#F99F38', color: 'white', borderColor: '#F99F38' } : { backgroundColor: 'white', color: '#374151', borderColor: '#E5E7EB' }}>
          📁 CSV Upload
        </button>
      </div>

      {!uploadMode ? (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b" style={{ backgroundColor: '#052460' }}>
              <h3 className="font-semibold text-white text-sm">Your Pillar Metrics — {period}</h3>
            </div>
            {hasOrganiserInputs && (
              <div className="border-b border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
                Organiser inputs now separate delegate and exhibitor spend, indirect visitor spend, event and shoulder days, accompanying guests, exhibiting cost, direct spend into Victoria, and national/international segmentation. {INPUT_CATEGORY_CAVEAT}
              </div>
            )}
            {metrics.map((m, i) => (
              <div key={m.code} className={`flex items-center gap-4 p-4 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{m.label}</div>
                  <div className="text-xs text-gray-400">{m.description}</div>
                  {ORGANISER_METRIC_GUIDANCE[m.code] && (
                    <div className="mt-2 rounded-lg bg-orange-50 px-3 py-2 text-xs leading-5 text-orange-800">
                      {ORGANISER_METRIC_GUIDANCE[m.code]}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-12 text-right">{unitLabel(m.unit)}</span>
                  <input type="number" step="any" value={values[m.code] || ''}
                    onChange={e => setValues(v => ({ ...v, [m.code]: e.target.value }))}
                    className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right text-gray-900"
                    placeholder="0" />
                </div>
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="px-8 py-3 rounded-xl font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#052460' }}>
            {loading ? 'Submitting...' : 'Submit Data'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCSVUpload}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upload CSV File</h3>
              <a
                href="/abea-template.csv"
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#F99F38' }}
              >
                📥 Download CSV Template
              </a>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Expected columns: <code className="bg-gray-100 px-1 rounded">metric_code, value, period, notes</code>.
              Values can include commas or dollar signs. Rows with blank values are ignored.
            </p>
            <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 font-mono mb-4 overflow-x-auto">
              metric_code,label,unit,pillar,value,period,notes<br/>
              ORG_DELEGATE_DIRECT_EVENT_SPEND,Delegate and Exhibitor Direct Event Spend,AUD,ORGANISER,59520000,2025-FY,Subject to final government input multiplier<br/>
              ORG_DIRECT_VIC_SPEND,Organiser Direct Spend into Victoria,AUD,ORGANISER,8900000,2025-FY,
            </div>
            <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
              The upload will stop before saving if a metric code is not active for your pillar, a percentage is over 100, a value is negative, or a row period does not match the selected reporting period.
            </div>
            <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:text-white"
              style={{ '--file-bg': '#052460' } as CSSProperties} />
          </div>
          <button type="submit" disabled={loading || !csvFile}
            className="px-8 py-3 rounded-xl font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#052460' }}>
            {loading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>
      )}
    </div>
  )
}
