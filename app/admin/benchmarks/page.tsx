'use client'
import { useEffect, useState } from 'react'

const PILLAR_COLORS: Record<string, string> = {
  VENUE: '#3B82F6', ORGANISER: '#00A99D', SUPPLIER: '#8B5CF6', BUREAU: '#F97316'
}

function fmt(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return v.toFixed(1)
}

export default function AdminBenchmarksPage() {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [calcResult, setCalcResult] = useState('')

  function load() {
    setLoading(true)
    fetch('/api/admin/benchmarks').then(r => r.json()).then(setSnapshots).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function recalculate() {
    setCalculating(true)
    setCalcResult('')
    const res = await fetch('/api/admin/benchmarks/calculate', { method: 'POST' })
    const data = await res.json()
    setCalculating(false)
    setCalcResult(`Calculated ${data.calculated} benchmark snapshots`)
    load()
  }

  const byPillar = snapshots.reduce((acc, s) => {
    if (!acc[s.pillar]) acc[s.pillar] = []
    acc[s.pillar].push(s)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Benchmarks</h1>
          <p className="text-gray-500 text-sm mt-1">Current benchmark snapshots across all pillars</p>
        </div>
        <button onClick={recalculate} disabled={calculating}
          className="px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60"
          style={{ backgroundColor: '#00A99D' }}>
          {calculating ? '⏳ Calculating...' : '🔄 Recalculate Benchmarks'}
        </button>
      </div>

      {calcResult && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{calcResult}</div>}

      {loading ? <div className="text-gray-400">Loading...</div> : (
        <div className="space-y-8">
          {Object.entries(byPillar).map(([pillar, snaps]) => (
            <div key={pillar} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center gap-3">
                <span className="px-3 py-1 text-sm font-bold text-white rounded" style={{ backgroundColor: PILLAR_COLORS[pillar] }}>{pillar}</span>
                <span className="text-sm text-gray-500">{snaps.length} metrics</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Metric</th>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Period</th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase">P25</th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Avg</th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase">Median</th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase">P75</th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 font-semibold uppercase">n</th>
                  </tr>
                </thead>
                <tbody>
                  {snaps.map((s, i) => (
                    <tr key={s.id} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.metricCode}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{s.period}</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-600">{fmt(s.p25Value || 0)}</td>
                      <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{fmt(s.avgValue)}</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-600">{fmt(s.medianValue || 0)}</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-600">{fmt(s.p75Value || 0)}</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-500">{s.sampleSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
