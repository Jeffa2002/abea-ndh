// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'

interface Stats {
  orgCount: number
  submissionCount: number
  metricsTracked: number
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats>({ orgCount: 12, submissionCount: 47, metricsTracked: 28 })

  useEffect(() => {
    fetch('/api/public/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {/* keep defaults */})
  }, [])

  const items = [
    { value: stats.orgCount, label: 'Organisations Contributing' },
    { value: stats.submissionCount, label: 'Data Points Submitted' },
    { value: stats.metricsTracked, label: 'Metrics Tracked Nationally' },
  ]

  return (
    <div style={{ backgroundColor: '#152D4A' }} className="py-10 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {items.map(item => (
          <div key={item.label}>
            <div className="text-5xl font-black mb-1" style={{ color: '#00A99D' }}>
              {item.value.toLocaleString()}
            </div>
            <div className="text-white/60 text-sm uppercase tracking-wider font-medium">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
