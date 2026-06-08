import type { Pillar } from '@prisma/client'

export type ReportFilters = {
  period?: string
  pillar?: Pillar
  region?: string
  tier?: string
  metric?: string
}

export type ReportMetricRow = {
  period: string
  pillar: Pillar
  metricCode: string
  metricLabel: string
  unit: string
  sampleSize: number
  avgValue: number
  totalValue: number
  minValue: number
  maxValue: number
  regions: string[]
  tiers: string[]
}

export function aggregateMetricRows(values: Array<{
  value: number
  period: string
  metric: { code: string; label: string; unit: string }
  submission: {
    period: string
    pillar: Pillar
    org: { region: string | null; tier: string | null }
  }
}>): ReportMetricRow[] {
  const map = new Map<string, {
    period: string
    pillar: Pillar
    metricCode: string
    metricLabel: string
    unit: string
    values: number[]
    regions: Set<string>
    tiers: Set<string>
  }>()

  for (const row of values) {
    const period = row.submission.period || row.period
    const key = [period, row.submission.pillar, row.metric.code].join('|')
    const current = map.get(key) || {
      period,
      pillar: row.submission.pillar,
      metricCode: row.metric.code,
      metricLabel: row.metric.label,
      unit: row.metric.unit,
      values: [],
      regions: new Set<string>(),
      tiers: new Set<string>(),
    }
    current.values.push(row.value)
    if (row.submission.org.region) current.regions.add(row.submission.org.region)
    if (row.submission.org.tier) current.tiers.add(row.submission.org.tier)
    map.set(key, current)
  }

  return [...map.values()]
    .map(row => {
      const totalValue = row.values.reduce((sum, value) => sum + value, 0)
      return {
        period: row.period,
        pillar: row.pillar,
        metricCode: row.metricCode,
        metricLabel: row.metricLabel,
        unit: row.unit,
        sampleSize: row.values.length,
        avgValue: row.values.length > 0 ? totalValue / row.values.length : 0,
        totalValue,
        minValue: Math.min(...row.values),
        maxValue: Math.max(...row.values),
        regions: [...row.regions].sort(),
        tiers: [...row.tiers].sort(),
      }
    })
    .sort((a, b) => a.period.localeCompare(b.period) || a.pillar.localeCompare(b.pillar) || a.metricCode.localeCompare(b.metricCode))
}

export function formatReportValue(value: number, unit: string) {
  if (unit === 'AUD') {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }
  if (unit === 'percent') return `${value.toFixed(1)}%`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(1)
}
