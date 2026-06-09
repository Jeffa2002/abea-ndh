import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aggregateMetricRows } from '@/lib/reporting'
import { REPORTING_MIN_SAMPLE_SIZE, isSuppressed } from '@/lib/privacy'
import { logSecurityEvent } from '@/lib/securityLog'

export const dynamic = 'force-dynamic'

async function isAuthorized(req: NextRequest) {
  const feedToken = process.env.POWERBI_FEED_TOKEN
  const auth = req.headers.get('authorization')
  if (feedToken && auth === `Bearer ${feedToken}`) return { authorized: true, mode: 'feed' as const, session: null }

  const session = await getSession()
  if (session?.role === 'ADMIN') return { authorized: true, mode: 'admin' as const, session }
  return { authorized: false, mode: null, session: null }
}

export async function GET(req: NextRequest) {
  const auth = await isAuthorized(req)
  if (!auth.authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const table = req.nextUrl.searchParams.get('table') || 'aggregates'
  const period = req.nextUrl.searchParams.get('period') || undefined
  await logSecurityEvent({
    eventType: 'POWERBI_FEED_ACCESSED',
    req,
    session: auth.session,
    target: table,
    metadata: { period, mode: auth.mode },
  })
  if (auth.mode === 'feed' && table !== 'aggregates') {
    return NextResponse.json(
      { error: 'Bearer-token Power BI access is limited to privacy-suppressed aggregate rows.' },
      { status: 403 }
    )
  }

  const submissionWhere = {
    status: 'PROCESSED' as const,
    period,
    OR: [
      { importBatchId: null },
      { importBatch: { excludeFromReporting: false } },
    ],
  }

  if (table === 'organisations') {
    const organisations = await prisma.organisation.findMany({
      where: { isApproved: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ table, rows: organisations })
  }

  if (table === 'submissions') {
    const submissions = await prisma.dataSubmission.findMany({
      where: submissionWhere,
      include: { org: true, importBatch: true, _count: { select: { metrics: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({
      table,
      rows: submissions.map(submission => ({
        submission_id: submission.id,
        organisation_id: submission.orgId,
        organisation_name: submission.org.name,
        pillar: submission.pillar,
        period: submission.period,
        status: submission.status,
        region: submission.org.region,
        tier: submission.org.tier,
        reporting_cohort: submission.org.reportingCohort,
        primary_event_type: submission.org.primaryEventType,
        capacity_band: submission.org.capacityBand,
        government_program: submission.org.governmentProgram,
        metric_count: submission._count.metrics,
        submitted_at: submission.createdAt,
        reviewed_at: submission.reviewedAt,
        import_batch_id: submission.importBatchId,
        import_filename: submission.importBatch?.filename,
      })),
    })
  }

  if (table === 'aggregates') {
    const metricValues = await prisma.metricValue.findMany({
      where: { submission: submissionWhere },
      include: { metric: true, submission: { include: { org: true } } },
    })
    return NextResponse.json({
      table,
      rows: aggregateMetricRows(metricValues).map(row => ({
        ...row,
        privacyThreshold: REPORTING_MIN_SAMPLE_SIZE,
        suppressed: isSuppressed(row.sampleSize),
        avgValue: isSuppressed(row.sampleSize) ? null : row.avgValue,
        totalValue: isSuppressed(row.sampleSize) ? null : row.totalValue,
        minValue: isSuppressed(row.sampleSize) ? null : row.minValue,
        maxValue: isSuppressed(row.sampleSize) ? null : row.maxValue,
      })),
    })
  }

  if (table === 'import_batches') {
    const batches = await prisma.importBatch.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ table, rows: batches })
  }

  const metricValues = await prisma.metricValue.findMany({
    where: { submission: submissionWhere },
    include: { metric: true, submission: { include: { org: true, importBatch: true } } },
    orderBy: [{ period: 'desc' }, { metric: { code: 'asc' } }],
  })

  return NextResponse.json({
    table: 'metric_values',
    rows: metricValues.map(row => ({
      metric_value_id: row.id,
      submission_id: row.submissionId,
      organisation_id: row.submission.orgId,
      organisation_name: row.submission.org.name,
      pillar: row.submission.pillar,
      period: row.period,
      metric_code: row.metric.code,
      metric_label: row.metric.label,
      metric_unit: row.metric.unit,
      value: row.value,
      region: row.submission.org.region,
      tier: row.submission.org.tier,
      reporting_cohort: row.submission.org.reportingCohort,
      primary_event_type: row.submission.org.primaryEventType,
      capacity_band: row.submission.org.capacityBand,
      government_program: row.submission.org.governmentProgram,
      import_batch_id: row.submission.importBatchId,
      import_filename: row.submission.importBatch?.filename,
      created_at: row.createdAt,
    })),
  })
}
