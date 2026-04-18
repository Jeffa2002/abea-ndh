// @ts-nocheck
'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'

const PILLAR_COLORS: Record<string, string> = {
  VENUE: '#3B82F6',
  ORGANISER: '#00A99D',
  SUPPLIER: '#8B5CF6',
  BUREAU: '#F97316',
}

function formatValue(value: number, code: string): string {
  if (value == null || isNaN(value)) return '—'
  const c = code.toUpperCase()
  const isAUD = c.includes('IMPACT') || c.includes('VALUE') || c.includes('SPEND') || c.includes('BUDGET') || c.includes('REVENUE')
  const isPct = c.includes('RATE') || c.includes('PCT') || c.includes('GROWTH') || c.includes('WIN')
  if (isAUD) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }
  if (isPct) return `${value.toFixed(1)}%`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(0)
}

type Snapshot = {
  id: string
  pillar: string
  metricCode: string
  period: string
  avgValue: number
  p25Value: number | null
  p75Value: number | null
  sampleSize: number
}

type PillarData = {
  pillar: string
  orgCount: number
  snapshots: Snapshot[]
}

type Props = {
  overview: PillarData[]
  totalOrgs: number
  totalSubmissions: number
  metricsTracked: number
}

export function PillarCharts({ overview, totalOrgs, totalSubmissions, metricsTracked }: Props) {
  // Build cross-pillar bar chart data: one bar per pillar per snapshot
  const pillarSummary = overview.map(({ pillar, orgCount, snapshots }) => ({
    pillar,
    orgCount,
    metricsCount: snapshots.length,
    color: PILLAR_COLORS[pillar],
  }))

  return (
    <div>
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="text-3xl font-black mb-1" style={{ color: '#1E3A5F' }}>{totalOrgs}</div>
          <div className="text-xs text-gray-400">Participating Organisations</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="text-3xl font-black mb-1" style={{ color: '#00A99D' }}>{totalSubmissions}</div>
          <div className="text-xs text-gray-400">Processed Submissions</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="text-3xl font-black mb-1" style={{ color: '#8B5CF6' }}>{metricsTracked}</div>
          <div className="text-xs text-gray-400">Metrics Tracked</div>
        </div>
      </div>

      {/* Orgs per pillar bar chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-800 mb-1">Organisations by Pillar</h2>
        <p className="text-xs text-gray-400 mb-4">Approved participating organisations</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={pillarSummary} barCategoryGap="40%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="pillar" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
              formatter={(v) => [v, 'Organisations']}
            />
            <Bar dataKey="orgCount" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {pillarSummary.map((entry) => (
                <Cell key={entry.pillar} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-pillar deep dive charts */}
      {overview.map(({ pillar, orgCount, snapshots }) => {
        if (snapshots.length === 0) return null
        const color = PILLAR_COLORS[pillar]
        const ICONS: Record<string, string> = { VENUE: '🏛️', ORGANISER: '📋', SUPPLIER: '🔧', BUREAU: '🌏' }

        // Build chart data for this pillar (avg vs p75)
        const chartData = snapshots.slice(0, 8).map(s => ({
          name: s.metricCode.split('_').slice(1).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ').slice(0, 14),
          'Industry Avg': s.avgValue,
          'Top Quartile': s.p75Value ?? s.avgValue,
          code: s.metricCode,
        }))

        return (
          <div key={pillar} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div
              className="px-6 py-5 border-b flex items-center gap-4"
              style={{ backgroundColor: color + '12' }}
            >
              <span className="text-3xl">{ICONS[pillar]}</span>
              <div className="flex-1">
                <h2 className="font-bold text-lg" style={{ color: '#1E3A5F' }}>
                  {pillar.charAt(0) + pillar.slice(1).toLowerCase()}s
                </h2>
                <p className="text-sm text-gray-500">
                  {orgCount} approved organisations · {snapshots.length} benchmarks tracked
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {pillar}
              </span>
            </div>

            <div className="p-6">
              <p className="text-xs text-gray-400 mb-4">Industry average vs top quartile across all metrics</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tickFormatter={(v) => {
                      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`
                      if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
                      return v
                    }}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Industry Avg" fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Top Quartile" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>

              {/* Metric stat grid for the rest */}
              {snapshots.length > 0 && (
                <div className="grid grid-cols-3 gap-0 divide-x divide-y border-t border-gray-100 mt-6">
                  {snapshots.map(s => (
                    <div key={s.id} className="p-4">
                      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1 truncate">
                        {s.metricCode.split('_').slice(1).join(' ')}
                      </div>
                      <div className="text-xl font-black mb-1" style={{ color }}>
                        {formatValue(s.avgValue, s.metricCode)}
                      </div>
                      <div className="text-xs text-gray-400">industry avg · n={s.sampleSize}</div>
                      {(s.p25Value != null || s.p75Value != null) && (
                        <div className="flex gap-2 mt-1 text-xs text-gray-400">
                          {s.p25Value != null && <span>P25: {formatValue(s.p25Value, s.metricCode)}</span>}
                          {s.p75Value != null && <span>P75: {formatValue(s.p75Value, s.metricCode)}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
