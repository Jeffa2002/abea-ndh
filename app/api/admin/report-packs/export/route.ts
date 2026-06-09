import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aggregateMetricRows, formatReportValue } from '@/lib/reporting'
import { INPUT_CATEGORY_CAVEAT, METHODOLOGY_UPDATED_AT, METHODOLOGY_VERSION } from '@/lib/inputCategories'
import { OPEN_DECISIONS } from '@/lib/openDecisions'
import { REPORTING_MIN_SAMPLE_SIZE, displaySampleValue } from '@/lib/privacy'
import { logSecurityEvent } from '@/lib/securityLog'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')

  const period = req.nextUrl.searchParams.get('period') || '2025-H1'
  const audience = req.nextUrl.searchParams.get('audience') || 'board'
  await logSecurityEvent({ eventType: 'REPORT_PACK_EXPORTED', req, session, target: `${audience}:${period}` })
  const generatedAt = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  const submissionWhere = {
    status: 'PROCESSED' as const,
    period,
    OR: [{ importBatchId: null }, { importBatch: { excludeFromReporting: false } }],
  }

  const [orgCount, submissionCount, metricValues, importBatches, incompleteSubmissions] = await Promise.all([
    prisma.organisation.count({ where: { isApproved: true } }),
    prisma.dataSubmission.count({ where: submissionWhere }),
    prisma.metricValue.findMany({
      where: { submission: submissionWhere },
      include: { metric: true, submission: { include: { org: true } } },
    }),
    prisma.importBatch.findMany({ where: { period }, orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.dataSubmission.findMany({
      where: { ...submissionWhere },
      include: { org: true, _count: { select: { metrics: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  const aggregates = aggregateMetricRows(metricValues)
  const economicRows = aggregates.filter(row => (
    row.metricCode.includes('IMPACT') ||
    row.metricCode.includes('SPEND') ||
    row.metricCode.includes('BUDGET') ||
    row.metricCode.includes('REVENUE')
  ))
  const totalEconomicSignal = economicRows.reduce((sum, row) => sum + (row.sampleSize >= REPORTING_MIN_SAMPLE_SIZE ? row.totalValue : 0), 0)
  const pillars = [...new Set(aggregates.map(row => row.pillar))]

  const NAVY = '#052460'
  const ORANGE = '#F99F38'
  const LIGHT = '#F8FAFC'
  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF' },
    cover: { padding: 52, fontFamily: 'Helvetica', backgroundColor: NAVY, color: '#FFFFFF' },
    h1: { fontSize: 30, fontFamily: 'Helvetica-Bold', marginBottom: 12 },
    h2: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 10 },
    h3: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 5 },
    text: { fontSize: 10, color: '#4B5563', lineHeight: 1.55 },
    small: { fontSize: 8, color: '#6B7280', lineHeight: 1.5 },
    cardRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    card: { flex: 1, backgroundColor: LIGHT, borderRadius: 8, padding: 12 },
    stat: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 },
    table: { borderTop: '1 solid #E5E7EB', marginTop: 8 },
    tr: { flexDirection: 'row', borderBottom: '1 solid #E5E7EB', paddingVertical: 7 },
    th: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#6B7280' },
    td: { fontSize: 8, color: '#374151' },
    badge: { fontSize: 8, color: '#FFFFFF', backgroundColor: ORANGE, padding: '3 6', borderRadius: 8 },
    footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between' },
  })
  const h = React.createElement

  const metricRows = aggregates.slice(0, 18)
  const doc = h(Document, { title: `ABEA ${audience} report pack ${period}` },
    h(Page, { size: 'A4', style: styles.cover },
      h(View, { style: { flex: 1, justifyContent: 'center' } },
        h(Text, { style: { fontSize: 10, color: ORANGE, fontFamily: 'Helvetica-Bold', marginBottom: 16 } }, 'ABEA NATIONAL DATA HUB'),
        h(Text, { style: styles.h1 }, 'Stakeholder Report Pack'),
        h(Text, { style: { fontSize: 15, color: '#FFFFFF', marginBottom: 32 } }, `${audience.toUpperCase()} · ${period}`),
        h(Text, { style: { fontSize: 10, color: '#D1D5DB' } }, `Generated ${generatedAt} · Methodology ${METHODOLOGY_VERSION}`),
      ),
    ),
    h(Page, { size: 'A4', style: styles.page },
      h(Text, { style: styles.h2 }, 'Executive Summary'),
      h(View, { style: styles.cardRow },
        h(View, { style: styles.card }, h(Text, { style: styles.stat }, String(orgCount)), h(Text, { style: styles.small }, 'Approved organisations')),
        h(View, { style: styles.card }, h(Text, { style: styles.stat }, String(submissionCount)), h(Text, { style: styles.small }, 'Processed submissions')),
        h(View, { style: styles.card }, h(Text, { style: styles.stat }, String(metricValues.length)), h(Text, { style: styles.small }, 'Metric fact rows')),
        h(View, { style: styles.card }, h(Text, { style: styles.stat }, formatReportValue(totalEconomicSignal, 'AUD')), h(Text, { style: styles.small }, 'Reportable economic signal')),
      ),
      h(Text, { style: styles.text },
        `This pack summarises governed reporting data for ${period}. It uses processed submissions only, excludes import batches marked out of reporting, and suppresses aggregate values below n=${REPORTING_MIN_SAMPLE_SIZE}.`
      ),
      h(View, { style: { marginTop: 18 } },
        h(Text, { style: styles.h2 }, 'Methodology Basis'),
        h(Text, { style: styles.text }, `Methodology ${METHODOLOGY_VERSION}, updated ${METHODOLOGY_UPDATED_AT}. ${INPUT_CATEGORY_CAVEAT}`),
      ),
      h(View, { style: { marginTop: 18 } },
        h(Text, { style: styles.h2 }, 'Pillar Coverage'),
        h(Text, { style: styles.text }, `Pillars represented: ${pillars.join(', ') || 'None'}. Benchmarks and report rows are generated from standardised core metrics.`),
      ),
      h(View, { style: styles.footer },
        h(Text, { style: styles.small }, 'ABEA National Data Hub'),
        h(Text, { style: styles.small }, 'Page 2'),
      ),
    ),
    h(Page, { size: 'A4', style: styles.page },
      h(Text, { style: styles.h2 }, 'Aggregate Metric Summary'),
      h(View, { style: styles.table },
        h(View, { style: styles.tr },
          h(Text, { style: [styles.th, { flex: 2 }] }, 'Metric'),
          h(Text, { style: [styles.th, { flex: 1 }] }, 'Pillar'),
          h(Text, { style: [styles.th, { flex: 0.6 }] }, 'n'),
          h(Text, { style: [styles.th, { flex: 1 }] }, 'Average'),
          h(Text, { style: [styles.th, { flex: 1 }] }, 'Total'),
        ),
        ...metricRows.map(row => h(View, { key: `${row.period}-${row.metricCode}`, style: styles.tr },
          h(Text, { style: [styles.td, { flex: 2 }] }, row.metricLabel),
          h(Text, { style: [styles.td, { flex: 1 }] }, row.pillar),
          h(Text, { style: [styles.td, { flex: 0.6 }] }, String(row.sampleSize)),
          h(Text, { style: [styles.td, { flex: 1 }] }, displaySampleValue(formatReportValue(row.avgValue, row.unit), row.sampleSize)),
          h(Text, { style: [styles.td, { flex: 1 }] }, displaySampleValue(formatReportValue(row.totalValue, row.unit), row.sampleSize)),
        )),
      ),
      h(View, { style: styles.footer },
        h(Text, { style: styles.small }, `Privacy threshold n=${REPORTING_MIN_SAMPLE_SIZE}`),
        h(Text, { style: styles.small }, 'Page 3'),
      ),
    ),
    h(Page, { size: 'A4', style: styles.page },
      h(Text, { style: styles.h2 }, 'Data Quality and Import Notes'),
      h(Text, { style: styles.text }, `Recent import batches for ${period}: ${importBatches.length}. Incomplete/recent submissions sampled: ${incompleteSubmissions.length}.`),
      h(View, { style: { marginTop: 14 } },
        ...importBatches.map(batch => h(View, { key: batch.id, style: { marginBottom: 8 } },
          h(Text, { style: styles.h3 }, batch.filename),
          h(Text, { style: styles.small }, `${batch.status} · rows ${batch.rowCount} · accepted ${batch.acceptedRows} · rejected ${batch.rejectedRows} · ${batch.excludeFromReporting ? 'Excluded' : 'Included'} in reporting`),
        )),
      ),
      h(View, { style: { marginTop: 12 } },
        h(Text, { style: styles.h2 }, 'Open Decisions Appendix'),
        ...OPEN_DECISIONS.slice(0, 6).map(decision => h(View, { key: decision.id, style: { marginBottom: 9 } },
          h(Text, { style: styles.h3 }, `${decision.id}: ${decision.title}`),
          h(Text, { style: styles.small }, `${decision.owner} · ${decision.priority} · ${decision.status}. ${decision.recommendation}`),
        )),
      ),
      h(View, { style: styles.footer },
        h(Text, { style: styles.small }, 'Stakeholder review pack'),
        h(Text, { style: styles.small }, 'Page 4'),
      ),
    ),
  )

  const buffer = await renderToBuffer(doc)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="abea-${audience}-report-pack-${period}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
