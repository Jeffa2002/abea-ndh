'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PERIODS = ['2024-FY', '2024-H1', '2024-H2', '2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-FY']

export default function SubmitPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('2024-FY')
  const [metrics, setMetrics] = useState<any[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [uploadMode, setUploadMode] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/data/metrics').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setMetrics(data)
        const init: Record<string, string> = {}
        data.forEach((m: any) => { init[m.code] = '' })
        setValues(init)
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const numericValues: Record<string, number> = {}
    for (const [k, v] of Object.entries(values)) {
      if (v !== '') numericValues[k] = parseFloat(v)
    }

    const res = await fetch('/api/data/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, metrics: numericValues }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Submission failed'); return }
    setSuccess(`Submission successful! ID: ${data.submissionId}`)
    setTimeout(() => router.push('/dashboard/submissions'), 2000)
  }

  async function handleCSVUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!csvFile) return
    setLoading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', csvFile)
    fd.append('period', period)
    const res = await fetch('/api/data/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Upload failed'); return }
    setSuccess(`CSV uploaded! ${data.recordsProcessed} metrics processed.`)
    setTimeout(() => router.push('/dashboard/submissions'), 2000)
  }

  function unitLabel(unit: string) {
    if (unit === 'AUD') return 'AUD $'
    if (unit === 'percent') return '%'
    return unit
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>Submit Data</h1>
      <p className="text-gray-500 text-sm mb-8">Submit your organisation&apos;s metrics for a specific period</p>

      {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      {/* Period selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Reporting Period</label>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map(p => (
            <button key={p} type="button" onClick={() => setPeriod(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={period === p ? { backgroundColor: '#1E3A5F', color: 'white', borderColor: '#1E3A5F' } : { backgroundColor: 'white', color: '#374151', borderColor: '#E5E7EB' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setUploadMode(false)}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={!uploadMode ? { backgroundColor: '#00A99D', color: 'white', borderColor: '#00A99D' } : { backgroundColor: 'white', color: '#374151', borderColor: '#E5E7EB' }}>
          📝 Manual Entry
        </button>
        <button onClick={() => setUploadMode(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style={uploadMode ? { backgroundColor: '#00A99D', color: 'white', borderColor: '#00A99D' } : { backgroundColor: 'white', color: '#374151', borderColor: '#E5E7EB' }}>
          📁 CSV Upload
        </button>
      </div>

      {!uploadMode ? (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b" style={{ backgroundColor: '#1E3A5F' }}>
              <h3 className="font-semibold text-white text-sm">Your Pillar Metrics — {period}</h3>
            </div>
            {metrics.map((m, i) => (
              <div key={m.code} className={`flex items-center gap-4 p-4 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{m.label}</div>
                  <div className="text-xs text-gray-400">{m.description}</div>
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
            style={{ backgroundColor: '#1E3A5F' }}>
            {loading ? 'Submitting...' : 'Submit Data'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCSVUpload}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Upload CSV File</h3>
            <p className="text-sm text-gray-500 mb-4">Expected columns: <code className="bg-gray-100 px-1 rounded">metric_code, value, period, notes</code></p>
            <div className="p-4 bg-gray-50 rounded-xl text-xs text-gray-500 font-mono mb-4">
              metric_code,value,period,notes<br/>
              VENUE_OCCUPANCY_RATE,72,2024-FY,Annual average<br/>
              VENUE_EVENTS_HOSTED,312,2024-FY,
            </div>
            <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:text-white"
              style={{ '--file-bg': '#1E3A5F' } as any} />
          </div>
          <button type="submit" disabled={loading || !csvFile}
            className="px-8 py-3 rounded-xl font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#1E3A5F' }}>
            {loading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>
      )}
    </div>
  )
}
