import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toCsv } from '@/lib/csv'
import { aggregateMetricRows } from '@/lib/reporting'
import { REPORTING_MIN_SAMPLE_SIZE, isSuppressed } from '@/lib/privacy'
import type { Pillar } from '@prisma/client'
import { logSecurityEvent } from '@/lib/securityLog'

const PILLARS: Pillar[] = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU']

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = req.nextUrl.searchParams
  const pillarParam = params.get('pillar')
  const pillar = PILLARS.includes(pillarParam as Pillar) ? pillarParam as Pillar : undefined
  const period = params.get('period') || undefined
  const region = params.get('region') || undefined
  const tier = params.get('tier') || undefined
  const metric = params.get('metric') || undefined
  await logSecurityEvent({
    eventType: 'AGGREGATE_REPORT_EXPORTED',
    req,
    session,
    target: period || 'all-periods',
    metadata: { pillar, region, tier, metric },
  })

  const metricValues = await prisma.metricValue.findMany({
    where: {
      metric: metric ? { code: { contains: metric, mode: 'insensitive' } } : undefined,
      submission: {
        status: 'PROCESSED',
        period,
        pillar,
        OR: [{ importBatchId: null }, { importBatch: { excludeFromReporting: false } }],
        org: { region, tier },
      },
    },
    include: {
      metric: true,
      submission: { include: { org: true } },
    },
  })

  const rows = aggregateMetricRows(metricValues).map(row => ({
    period: row.period,
    pillar: row.pillar,
    metric_code: row.metricCode,
    metric_label: row.metricLabel,
    unit: row.unit,
    sample_size: row.sampleSize,
    privacy_threshold: REPORTING_MIN_SAMPLE_SIZE,
    suppressed: isSuppressed(row.sampleSize),
    average_value: isSuppressed(row.sampleSize) ? null : row.avgValue,
    total_value: isSuppressed(row.sampleSize) ? null : row.totalValue,
    min_value: isSuppressed(row.sampleSize) ? null : row.minValue,
    max_value: isSuppressed(row.sampleSize) ? null : row.maxValue,
    regions: row.regions.join('|'),
    tiers: row.tiers.join('|'),
  }))

  const csv = toCsv(rows, [
    'period',
    'pillar',
    'metric_code',
    'metric_label',
    'unit',
    'sample_size',
    'privacy_threshold',
    'suppressed',
    'average_value',
    'total_value',
    'min_value',
    'max_value',
    'regions',
    'tiers',
  ])

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="abea-aggregate-report-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
