import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Pillar, SubmissionStatus } from '@prisma/client'

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as { period?: string; minSampleSize?: number }
  const periodFilter = body.period?.trim()
  const minSampleSize = Number.isFinite(body.minSampleSize) ? Math.max(1, Math.floor(Number(body.minSampleSize))) : 5
  const pillars = Object.values(Pillar)
  const results: Array<{ pillar: Pillar; metricCode: string; period: string; sampleSize: number }> = []

  for (const pillar of pillars) {
    const metricDefs = await prisma.metricDefinition.findMany({ where: { pillar, isCore: true } })

    for (const metric of metricDefs) {
      const values = await prisma.metricValue.findMany({
        where: {
          metric: { code: metric.code },
          submission: { status: SubmissionStatus.PROCESSED, pillar },
          ...(periodFilter ? { period: periodFilter } : {}),
        },
        select: { value: true, period: true },
      })

      const byPeriod: Record<string, number[]> = {}
      for (const v of values) {
        if (!byPeriod[v.period]) byPeriod[v.period] = []
        byPeriod[v.period].push(v.value)
      }

      for (const [period, vals] of Object.entries(byPeriod)) {
        if (vals.length < minSampleSize) continue
        const sorted = [...vals].sort((a, b) => a - b)
        const avg = vals.reduce((s, v) => s + v, 0) / vals.length
        const median = percentile(sorted, 50)
        const p25 = percentile(sorted, 25)
        const p75 = percentile(sorted, 75)

        await prisma.benchmarkSnapshot.deleteMany({
          where: {
            pillar,
            metricCode: metric.code,
            period,
            region: null,
            tier: null,
          },
        })

        await prisma.benchmarkSnapshot.create({
          data: {
            pillar,
            metricCode: metric.code,
            period,
            avgValue: avg,
            medianValue: median,
            p25Value: p25,
            p75Value: p75,
            sampleSize: vals.length,
          },
        })
        results.push({ pillar, metricCode: metric.code, period, sampleSize: vals.length })
      }
    }
  }

  return NextResponse.json({ calculated: results.length, minSampleSize, period: periodFilter || 'all processed periods', snapshots: results })
}
