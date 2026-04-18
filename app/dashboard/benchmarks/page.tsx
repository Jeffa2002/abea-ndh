// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const PILLARS = ['ALL', 'VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU']
const PILLAR_LABELS: Record<string, string> = {
  ALL: 'All',
  VENUE: 'Venues',
  ORGANISER: 'Organisers',
  SUPPLIER: 'Suppliers',
  BUREAU: 'Bureaux',
}

function formatValue(value: number, unit: string): string {
  if (!value && value !== 0) return '—'
  if (unit === 'AUD') {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }
  if (unit === 'percent') return `${value.toFixed(1)}%`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(0)
}

function getUnitFromCode(code: string): string {
  const c = code.toUpperCase()
  if (c.includes('RATE') || c.includes('PCT') || c.includes('WIN') || c.includes('GROWTH') || c.includes('REPEAT') || c.includes('INTL')) return 'percent'
  if (c.includes('VALUE') || c.includes('IMPACT') || c.includes('SPEND') || c.includes('BUDGET') || c.includes('REVENUE') || c.includes('DELEGATE_SPEND')) return 'AUD'
  return 'count'
}

function metricLabel(code: string): string {
  return code.split('_').slice(1).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

export default function BenchmarksPage() {
  const [activePillar, setActivePillar] = useState('ALL')
  const [benchmarks, setBenchmarks] = useState([])
  const [myValueByCode, setMyValueByCode] = useState({})
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const pillars = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU']
    Promise.all([
      // Fetch benchmarks for all pillars
      ...pillars.map(p =>
        fetch(`/api/data/benchmarks?pillar=${p}`).then(r => r.json())
      ),
      fetch('/api/data/submissions').then(r => r.json()),
    ]).then(([venueB, orgB, supB, burB, subs]) => {
      const all = [
        ...(Array.isArray(venueB) ? venueB : []),
        ...(Array.isArray(orgB) ? orgB : []),
        ...(Array.isArray(supB) ? supB : []),
        ...(Array.isArray(burB) ? burB : []),
      ]
      setBenchmarks(all)

      // Build my value map from processed submissions
      const map: Record<string, { value: number; label: string; unit: string }> = {}
      const processed = (Array.isArray(subs) ? subs : []).filter(s => s.status === 'PROCESSED')
      // Sort by createdAt desc (most recent first)
      processed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      for (const sub of processed) {
        for (const mv of sub.metrics || []) {
          const code = mv.metric?.code
          if (code && !(code in map)) {
            map[code] = {
              value: mv.value,
              label: mv.metric.label,
              unit: mv.metric.unit,
            }
          }
        }
      }
      setMyValueByCode(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = activePillar === 'ALL'
    ? benchmarks
    : benchmarks.filter(b => b.pillar === activePillar)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch('/api/data/report')
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'abea-benchmark-report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Failed to generate report. Please try again.')
    }
    setDownloading(false)
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Industry Benchmarks</h1>
          <p className="text-gray-500 text-sm mt-1">How you compare to your peers · Data anonymised and aggregated</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#00A99D' }}
        >
          {downloading ? '⏳ Generating…' : '📄 Download PDF Report'}
        </button>
      </div>

      {/* Privacy notice */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 mb-6">
        🔒 Benchmarks are calculated from aggregated, anonymised data. Individual organisations are never identifiable.
      </div>

      {/* Pillar filter tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {PILLARS.map(p => (
          <button
            key={p}
            onClick={() => setActivePillar(p)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={
              activePillar === p
                ? { backgroundColor: '#1E3A5F', color: '#fff' }
                : { backgroundColor: '#F3F4F6', color: '#6B7280' }
            }
          >
            {PILLAR_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading benchmarks…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="font-bold text-lg mb-2 text-gray-800">No benchmarks available yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Benchmarks are published once enough organisations have submitted data.
          </p>
          <a
            href="/dashboard/submit"
            className="inline-block px-6 py-3 rounded-xl text-white text-sm font-semibold"
            style={{ backgroundColor: '#1E3A5F' }}
          >
            Submit Your Data →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(b => {
            const my = myValueByCode[b.metricCode]
            const unit = my?.unit || getUnitFromCode(b.metricCode)
            const label = my?.label || metricLabel(b.metricCode)
            const myVal = my?.value

            const chartData = [
              {
                name: 'Comparison',
                'Your Org': myVal ?? null,
                'Industry Avg': b.avgValue ?? null,
                'Top Quartile': b.p75Value ?? null,
              },
            ]

            let insightText = ''
            let insightColor = '#9CA3AF'
            let insightArrow = '→'
            if (myVal !== undefined && b.avgValue) {
              const pct = ((myVal - b.avgValue) / b.avgValue) * 100
              if (pct > 1) {
                insightText = `You're ${Math.abs(pct).toFixed(0)}% above industry average`
                insightColor = '#10B981'
                insightArrow = '↑'
              } else if (pct < -1) {
                insightText = `You're ${Math.abs(pct).toFixed(0)}% below industry average`
                insightColor = '#EF4444'
                insightArrow = '↓'
              } else {
                insightText = `You're at the industry average`
                insightColor = '#6B7280'
                insightArrow = '→'
              }
            }

            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{label}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white ml-2 shrink-0"
                    style={{ backgroundColor: '#1E3A5F' }}
                  >
                    {b.pillar}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">{b.period} · n={b.sampleSize} orgs</p>

                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis
                      tickFormatter={v => formatValue(v, unit)}
                      tick={{ fontSize: 11, fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [formatValue(value, unit), name]}
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #E5E7EB',
                        fontSize: 12,
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="Your Org" fill="#1E3A5F" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Industry Avg" fill="#00A99D" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Top Quartile" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 pt-4 border-t border-gray-50">
                  {insightText ? (
                    <div className="text-xs font-semibold flex items-center gap-1" style={{ color: insightColor }}>
                      <span className="text-base leading-none">{insightArrow}</span>
                      {insightText}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      Submit your data to see your comparison
                    </div>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Avg: <span className="font-medium text-gray-600">{formatValue(b.avgValue, unit)}</span></span>
                    {b.p25Value != null && <span>P25: <span className="font-medium">{formatValue(b.p25Value, unit)}</span></span>}
                    {b.p75Value != null && <span>P75: <span className="font-medium">{formatValue(b.p75Value, unit)}</span></span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
