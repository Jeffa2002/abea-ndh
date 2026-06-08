'use client'
import { useCallback, useEffect, useState } from 'react'
import { PILLAR_COLORS } from '@/lib/brand'

interface BenchmarkSnapshot {
  id: string
  pillar: string
  metricCode: string
  period: string
  p25Value?: number | null
  avgValue: number
  medianValue?: number | null
  p75Value?: number | null
  sampleSize: number
}

function fmt(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return v.toFixed(1)
}

export default function AdminBenchmarksPage() {
  const [snapshots, setSnapshots] = useState<BenchmarkSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [calcResult, setCalcResult] = useState('')
  const [period, setPeriod] = useState('2024-FY')
  const [minSampleSize, setMinSampleSize] = useState(5)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/benchmarks')
      const data = await res.json() as BenchmarkSnapshot[]
      setSnapshots(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/admin/benchmarks')
      .then(res => res.json() as Promise<BenchmarkSnapshot[]>)
      .then(data => {
        if (active) setSnapshots(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function recalculate() {
    setCalculating(true)
    setCalcResult('')
    const res = await fetch('/api/admin/benchmarks/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, minSampleSize }),
    })
    const data = await res.json() as { calculated?: number; minSampleSize?: number; period?: string; error?: string }
    setCalculating(false)
    setCalcResult(res.ok
      ? `Calculated ${data.calculated} benchmark snapshots for ${data.period} with minimum n=${data.minSampleSize}`
      : data.error || 'Benchmark calculation failed')
    void load()
  }

  const byPillar = snapshots.reduce<Record<string, BenchmarkSnapshot[]>>((acc, s) => {
    if (!acc[s.pillar]) acc[s.pillar] = []
    acc[s.pillar].push(s)
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#052460' }}>Benchmarks</h1>
          <p className="text-gray-500 text-sm mt-1">Current benchmark snapshots across all pillars</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold uppercase text-gray-500">
            Period
            <input
              value={period}
              onChange={event => setPeriod(event.target.value)}
              className="mt-1 block w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-700"
            />
          </label>
          <label className="text-xs font-semibold uppercase text-gray-500">
            Min n
            <input
              type="number"
              min={1}
              value={minSampleSize}
              onChange={event => setMinSampleSize(Number(event.target.value))}
              className="mt-1 block w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal text-gray-700"
            />
          </label>
          <button onClick={recalculate} disabled={calculating}
            className="px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60"
            style={{ backgroundColor: '#F99F38' }}>
            {calculating ? 'Calculating...' : 'Recalculate'}
          </button>
        </div>
      </div>

      {calcResult && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{calcResult}</div>}

      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
        Governance rule: recalculation only uses submissions that an admin has explicitly processed. It refreshes matching snapshots for the selected period and skips metrics below the minimum sample threshold.
      </div>

      {loading ? <div className="text-gray-400">Loading...</div> : (
        <div className="space-y-8">
          {Object.entries(byPillar).map(([pillar, snaps]) => (
            <div key={pillar} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center gap-3">
                <span className="px-3 py-1 text-sm font-bold text-white rounded" style={{ backgroundColor: PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS] }}>{pillar}</span>
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
