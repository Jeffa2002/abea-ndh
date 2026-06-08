import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { toCsv } from '@/lib/csv'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const submissions = await prisma.dataSubmission.findMany({
    where: { status: { in: ['PROCESSED', 'REJECTED', 'ERROR'] } },
    include: {
      org: true,
      metrics: { include: { metric: true }, orderBy: { metric: { code: 'asc' } } },
      auditEvents: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  const rows: Array<Record<string, unknown>> = []

  for (const submission of submissions) {
    const latestEvent = submission.auditEvents[0]
    const base = {
      submission_id: submission.id,
      organisation_id: submission.orgId,
      organisation_name: submission.org.name,
      pillar: submission.pillar,
      region: submission.org.region,
      tier: submission.org.tier,
      period: submission.period,
      status: submission.status,
      submitted_at: submission.createdAt,
      reviewed_at: submission.reviewedAt,
      reviewed_by_id: submission.reviewedById,
      review_note: submission.reviewNote,
      latest_event: latestEvent?.action,
      latest_event_at: latestEvent?.createdAt,
      latest_event_note: latestEvent?.note,
    }

    if (submission.metrics.length === 0) {
      rows.push({ ...base, metric_code: '', metric_label: '', metric_unit: '', value: null })
      continue
    }

    for (const metricValue of submission.metrics) {
      rows.push({
        ...base,
        metric_code: metricValue.metric.code,
        metric_label: metricValue.metric.label,
        metric_unit: metricValue.metric.unit,
        value: metricValue.value,
      })
    }
  }

  const columns = [
    'submission_id',
    'organisation_id',
    'organisation_name',
    'pillar',
    'region',
    'tier',
    'period',
    'status',
    'submitted_at',
    'reviewed_at',
    'reviewed_by_id',
    'review_note',
    'latest_event',
    'latest_event_at',
    'latest_event_note',
    'metric_code',
    'metric_label',
    'metric_unit',
    'value',
  ]

  const csv = toCsv(rows, columns)
  const today = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="abea-reviewed-submissions-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
