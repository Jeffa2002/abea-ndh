import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  INPUT_CATEGORY_CAVEAT,
  METHODOLOGY_UPDATED_AT,
  METHODOLOGY_VERSION,
  METHODOLOGY_PRINCIPLES,
  METHODOLOGY_STEPS,
  UPDATED_INPUT_CATEGORIES,
} from '@/lib/inputCategories'
import React from 'react'

export const runtime = 'nodejs'

function formatValue(value: number, unit: string): string {
  if (value == null || isNaN(value)) return '—'
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
  if (c.includes('RATE') || c.includes('PCT') || c.includes('WIN') || c.includes('GROWTH') || c.includes('REPEAT')) return 'percent'
  if (c.includes('VALUE') || c.includes('IMPACT') || c.includes('SPEND') || c.includes('BUDGET') || c.includes('REVENUE')) return 'AUD'
  return 'count'
}

function getQuartileLabel(val: number, p25: number, avg: number, p75: number): string {
  if (val >= p75) return 'Top Quartile (75th+)'
  if (val >= avg) return 'Above Average (50–75th)'
  if (val >= p25) return 'Below Average (25–50th)'
  return 'Bottom Quartile (<25th)'
}

function getQuartileColor(val: number, avg: number): string {
  const pct = ((val - avg) / avg) * 100
  if (pct > 5) return '#00A7E2'
  if (pct < -5) return '#EF3D55'
  return '#F99F38'
}

export async function GET() {
  const session = await getSession()
  if (!session || !session.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')

  const org = await prisma.organisation.findUnique({ where: { id: session.orgId } })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  const coreMetrics = await prisma.metricDefinition.findMany({
    where: { pillar: org.pillar, isCore: true },
    select: { code: true },
  })

  const benchmarks = await prisma.benchmarkSnapshot.findMany({
    where: {
      pillar: org.pillar,
      period: '2024-FY',
      metricCode: { in: coreMetrics.map(metric => metric.code) },
    },
    orderBy: { metricCode: 'asc' },
  })

  const latestSub = await prisma.dataSubmission.findFirst({
    where: { orgId: session.orgId, status: 'PROCESSED' },
    include: { metrics: { include: { metric: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const myMap: Record<string, { value: number; label: string; unit: string }> = {}
  if (latestSub) {
    for (const mv of latestSub.metrics) {
      myMap[mv.metric.code] = { value: mv.value, label: mv.metric.label, unit: mv.metric.unit }
    }
  }
  const benchmarkSampleTotal = benchmarks.reduce((sum, benchmark) => sum + benchmark.sampleSize, 0)
  const benchmarkVintage = benchmarks[0]?.createdAt
    ? new Date(benchmarks[0].createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not available'
  const submissionVintage = latestSub?.reviewedAt || latestSub?.processedAt || latestSub?.createdAt

  // Tally performance
  let above = 0, atAvg = 0, below = 0, noData = 0
  for (const b of benchmarks) {
    const my = myMap[b.metricCode]
    if (!my) { noData++; continue }
    const pct = ((my.value - b.avgValue) / b.avgValue) * 100
    if (pct > 5) above++
    else if (pct < -5) below++
    else atAvg++
  }

  const currentYear = new Date().getFullYear()
  const dateGenerated = new Date().toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const NAVY = '#052460'
  const SUNDAY = '#F99F38'
  const AMBER = SUNDAY
  const GREEN = '#00A7E2'
  const RED = '#EF3D55'
  const LIGHT = '#EFEEEE'

  const styles = StyleSheet.create({
    coverPage: {
      backgroundColor: NAVY,
      padding: 0,
    },
    page: {
      fontFamily: 'Helvetica',
      backgroundColor: '#FFFFFF',
      padding: 40,
    },
    coverContent: {
      flex: 1,
      padding: 60,
      justifyContent: 'center',
    },
    coverAccent: {
      backgroundColor: SUNDAY,
      height: 6,
      width: 60,
      marginBottom: 32,
      borderRadius: 3,
    },
    coverTitle: {
      fontSize: 32,
      fontFamily: 'Helvetica-Bold',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    coverSubtitle: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.7)',
      marginBottom: 48,
    },
    coverOrg: {
      fontSize: 14,
      color: '#FFFFFF',
      fontFamily: 'Helvetica-Bold',
      marginBottom: 6,
    },
    coverMeta: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.5)',
    },
    coverFooter: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      padding: '24 60',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    coverFooterText: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.4)',
    },
    sectionHeader: {
      backgroundColor: NAVY,
      padding: '10 16',
      marginBottom: 16,
      borderRadius: 6,
    },
    sectionHeaderText: {
      fontSize: 13,
      fontFamily: 'Helvetica-Bold',
      color: '#FFFFFF',
    },
    summaryBox: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    statNum: {
      fontSize: 28,
      fontFamily: 'Helvetica-Bold',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 9,
      color: '#6B7280',
      textAlign: 'center',
    },
    metricRow: {
      borderBottom: '1 solid #F3F4F6',
      paddingTop: 12,
      paddingBottom: 12,
    },
    metricName: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: '#1F2937',
      marginBottom: 6,
    },
    metricGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    metricCell: {
      flex: 1,
    },
    metricCellLabel: {
      fontSize: 8,
      color: '#9CA3AF',
      marginBottom: 2,
      textTransform: 'uppercase',
    },
    metricCellValue: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
    },
    barLabel: {
      fontSize: 8,
      color: '#9CA3AF',
      width: 60,
    },
    barFill: {
      height: 6,
      borderRadius: 3,
    },
    barTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: '#F3F4F6',
      flex: 1,
    },
    quartileTag: {
      fontSize: 8,
      paddingTop: 2,
      paddingBottom: 2,
      paddingLeft: 6,
      paddingRight: 6,
      borderRadius: 10,
      color: '#FFFFFF',
    },
    pageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingBottom: 12,
      borderBottom: '2 solid #052460',
    },
    pageHeaderTitle: {
      fontSize: 16,
      fontFamily: 'Helvetica-Bold',
      color: NAVY,
    },
    pageHeaderSub: {
      fontSize: 9,
      color: '#9CA3AF',
      marginTop: 2,
    },
    pageFooter: {
      position: 'absolute',
      bottom: 20,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    footerText: {
      fontSize: 8,
      color: '#9CA3AF',
    },
    methodGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    methodCard: {
      flex: 1,
      padding: 12,
      backgroundColor: LIGHT,
      borderRadius: 8,
    },
    methodCardTitle: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      color: NAVY,
      marginBottom: 5,
    },
    methodCardText: {
      fontSize: 8,
      color: '#4B5563',
      lineHeight: 1.5,
    },
    dataBasisBox: {
      padding: 12,
      backgroundColor: '#F8FAFC',
      borderRadius: 8,
      marginBottom: 14,
      borderLeft: `4 solid ${SUNDAY}`,
    },
    dataBasisText: {
      fontSize: 9,
      color: '#4B5563',
      lineHeight: 1.6,
    },
  })

  const h = React.createElement

  const doc = h(Document, { title: `ABEA Benchmarking Report — ${org.name}` },
    // ---- COVER PAGE ----
    h(Page, { size: 'A4', style: styles.coverPage },
      h(View, { style: styles.coverContent },
        h(View, { style: styles.coverAccent }),
        h(Text, { style: styles.coverTitle }, 'Benchmarking\nReport'),
        h(Text, { style: styles.coverSubtitle }, `ABEA National Data Hub · Methodology ${METHODOLOGY_VERSION}`),
        h(Text, { style: styles.coverOrg }, org.name),
        h(Text, { style: styles.coverMeta }, `Pillar: ${org.pillar}  ·  Period: ${currentYear}-FY  ·  Generated: ${dateGenerated}`),
        h(Text, { style: [styles.coverMeta, { marginTop: 8 }] }, `Benchmark vintage: ${benchmarkVintage}  ·  Submission basis: ${latestSub ? latestSub.period : 'No processed submission'}`),
      ),
      h(View, { style: styles.coverFooter },
        h(Text, { style: styles.coverFooterText }, '© Australian Business Events Association'),
        h(Text, { style: styles.coverFooterText }, 'CONFIDENTIAL — FOR MEMBER USE ONLY'),
      ),
    ),

    // ---- EXECUTIVE SUMMARY PAGE ----
    h(Page, { size: 'A4', style: styles.page },
      h(View, { style: styles.pageHeader },
        h(View, null,
          h(Text, { style: styles.pageHeaderTitle }, 'Executive Summary'),
          h(Text, { style: styles.pageHeaderSub }, `${org.name}  ·  ${org.pillar}  ·  ${currentYear}-FY`),
        ),
        h(Text, { style: { fontSize: 10, color: SUNDAY, fontFamily: 'Helvetica-Bold' } }, 'ABEA NDH'),
      ),

      h(View, { style: { marginBottom: 24 } },
        h(Text, { style: { fontSize: 11, color: '#4B5563', lineHeight: 1.6 } },
          `This report summarises ${org.name}'s performance against industry benchmarks across the ${org.pillar.toLowerCase()} pillar. ` +
          `Data has been compared to anonymised, aggregated industry averages from ${benchmarks.length} metric${benchmarks.length !== 1 ? 's' : ''} tracked for the ${currentYear}-FY period.`
        ),
      ),

      h(View, { style: styles.dataBasisBox },
        h(Text, { style: styles.dataBasisText },
          `Data basis: ${latestSub ? `${latestSub.metrics.length} processed organisation metric rows from ${latestSub.period}` : 'no processed organisation submission'}; ` +
          `${benchmarks.length} benchmark metrics; ${benchmarkSampleTotal} cumulative benchmark sample observations. ` +
          `Only admin-processed records are included in official reporting outputs.`
        ),
      ),

      h(View, { style: styles.sectionHeader },
        h(Text, { style: styles.sectionHeaderText }, 'Performance Overview'),
      ),

      h(View, { style: styles.summaryBox },
        h(View, { style: [styles.statCard, { backgroundColor: '#ECFDF5' }] },
          h(Text, { style: [styles.statNum, { color: GREEN }] }, String(above)),
          h(Text, { style: styles.statLabel }, 'Metrics Above\nIndustry Average'),
        ),
        h(View, { style: [styles.statCard, { backgroundColor: '#FFFBEB' }] },
          h(Text, { style: [styles.statNum, { color: AMBER }] }, String(atAvg)),
          h(Text, { style: styles.statLabel }, 'Metrics At\nIndustry Average'),
        ),
        h(View, { style: [styles.statCard, { backgroundColor: '#FEF2F2' }] },
          h(Text, { style: [styles.statNum, { color: RED }] }, String(below)),
          h(Text, { style: styles.statLabel }, 'Metrics Below\nIndustry Average'),
        ),
        h(View, { style: [styles.statCard, { backgroundColor: LIGHT }] },
          h(Text, { style: [styles.statNum, { color: '#9CA3AF' }] }, String(noData)),
          h(Text, { style: styles.statLabel }, 'Metrics Without\nSubmitted Data'),
        ),
      ),

      above + atAvg + below === 0
        ? h(View, { style: { padding: 24, backgroundColor: LIGHT, borderRadius: 8, alignItems: 'center' } },
            h(Text, { style: { fontSize: 11, color: '#6B7280', textAlign: 'center' } },
              'No processed data submissions found.\nSubmit your data via the ABEA National Data Hub to unlock your full benchmarking report.'),
          )
        : h(View, { style: { padding: 16, backgroundColor: LIGHT, borderRadius: 8 } },
            h(Text, { style: { fontSize: 10, color: '#4B5563', lineHeight: 1.8 } },
              above > below
                ? `Strong performance: ${org.name} outperforms the industry average on ${above} out of ${above + atAvg + below} tracked metrics. Focus on maintaining strengths while addressing the ${below} area${below !== 1 ? 's' : ''} below average.`
                : below > above
                ? `Improvement opportunity: ${org.name} is below the industry average on ${below} out of ${above + atAvg + below} tracked metrics. Review the detailed metrics below to identify where investment can drive the most impact.`
                : `Balanced performance: ${org.name} is at or above the industry average on ${above + atAvg} out of ${above + atAvg + below} tracked metrics.`
            ),
          ),

      // Footer
      h(View, { style: styles.pageFooter },
        h(Text, { style: styles.footerText }, `Generated ${dateGenerated}  ·  ABEA National Data Hub`),
        h(Text, { style: styles.footerText }, 'Page 2'),
      ),
    ),

    // ---- METHODOLOGY PAGE ----
    h(Page, { size: 'A4', style: styles.page },
      h(View, { style: styles.pageHeader },
        h(View, null,
          h(Text, { style: styles.pageHeaderTitle }, 'Methodology'),
          h(Text, { style: styles.pageHeaderSub }, `Collection, validation, aggregation, and reporting basis · ${METHODOLOGY_VERSION} · Updated ${METHODOLOGY_UPDATED_AT}`),
        ),
        h(Text, { style: { fontSize: 10, color: SUNDAY, fontFamily: 'Helvetica-Bold' } }, 'ABEA NDH'),
      ),

      h(View, { style: { marginBottom: 18 } },
        h(Text, { style: { fontSize: 11, color: '#4B5563', lineHeight: 1.7 } },
          'The ABEA National Data Hub uses standardised pillar metrics so member submissions can be compared on a consistent basis. Organisation-level records remain private; benchmark outputs are aggregated and anonymised before publication.',
        ),
      ),

      h(View, { style: styles.dataBasisBox },
        h(Text, { style: styles.dataBasisText },
          `Reporting lake controls: this PDF records methodology version, reporting period, benchmark vintage (${benchmarkVintage}), ` +
          `submission review date (${submissionVintage ? new Date(submissionVintage).toLocaleDateString('en-AU') : 'not available'}), and sample sizes so future longitudinal extracts remain auditable.`
        ),
      ),

      h(View, { style: styles.sectionHeader },
        h(Text, { style: styles.sectionHeaderText }, 'Core Principles'),
      ),
      h(View, { style: styles.methodGrid },
        ...METHODOLOGY_PRINCIPLES.slice(0, 2).map(principle =>
          h(View, { key: principle.title, style: styles.methodCard },
            h(Text, { style: styles.methodCardTitle }, principle.title),
            h(Text, { style: styles.methodCardText }, principle.desc),
          ),
        ),
      ),
      h(View, { style: styles.methodGrid },
        ...METHODOLOGY_PRINCIPLES.slice(2).map(principle =>
          h(View, { key: principle.title, style: styles.methodCard },
            h(Text, { style: styles.methodCardTitle }, principle.title),
            h(Text, { style: styles.methodCardText }, principle.desc),
          ),
        ),
      ),

      h(View, { style: [styles.sectionHeader, { marginTop: 14 }] },
        h(Text, { style: styles.sectionHeaderText }, 'Updated Economic-Impact Inputs'),
      ),
      h(View, { style: styles.methodGrid },
        ...UPDATED_INPUT_CATEGORIES.map(category =>
          h(View, { key: category.title, style: styles.methodCard },
            h(Text, { style: styles.methodCardTitle }, category.title),
            h(Text, { style: styles.methodCardText }, category.items.join('  |  ')),
          ),
        ),
      ),
      h(Text, { style: { fontSize: 8, color: '#6B7280', marginBottom: 16, fontStyle: 'italic' } }, INPUT_CATEGORY_CAVEAT),

      h(View, { style: styles.sectionHeader },
        h(Text, { style: styles.sectionHeaderText }, 'Process'),
      ),
      h(View, { style: styles.methodGrid },
        ...METHODOLOGY_STEPS.slice(0, 2).map(step =>
          h(View, { key: step.n, style: styles.methodCard },
            h(Text, { style: styles.methodCardTitle }, `${step.n} ${step.title}`),
            h(Text, { style: styles.methodCardText }, step.desc),
          ),
        ),
      ),
      h(View, { style: styles.methodGrid },
        ...METHODOLOGY_STEPS.slice(2).map(step =>
          h(View, { key: step.n, style: styles.methodCard },
            h(Text, { style: styles.methodCardTitle }, `${step.n} ${step.title}`),
            h(Text, { style: styles.methodCardText }, step.desc),
          ),
        ),
      ),

      h(View, { style: styles.pageFooter },
        h(Text, { style: styles.footerText }, `Generated ${dateGenerated}  ·  ABEA National Data Hub`),
        h(Text, { style: styles.footerText }, 'Page 3'),
      ),
    ),

    // ---- METRIC DETAIL PAGES ----
    ...benchmarks.map((b, idx) => {
      const my = myMap[b.metricCode]
      const unit = my?.unit || getUnitFromCode(b.metricCode)
      const label = my?.label || b.metricCode.split('_').slice(1).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
      const myVal = my?.value
      const avgVal = b.avgValue
      const p25Val = b.p25Value || 0
      const p75Val = b.p75Value || 0
      const maxVal = Math.max(myVal || 0, p75Val, avgVal) * 1.2 || 1

      const hasMine = myVal !== undefined && myVal !== null
      const myValue = myVal ?? 0
      const pctDiff = hasMine ? ((myValue - avgVal) / avgVal) * 100 : undefined
      const quartile = hasMine ? getQuartileLabel(myValue, p25Val, avgVal, p75Val) : null
      const quartileColor = hasMine ? getQuartileColor(myValue, avgVal) : '#9CA3AF'
      const insightText = pctDiff === undefined
        ? ''
        : pctDiff > 5
          ? `${org.name} is performing ${Math.abs(pctDiff).toFixed(0)}% above the industry average for this metric. You are in strong territory - maintain this advantage.`
          : pctDiff < -5
            ? `${org.name} is ${Math.abs(pctDiff).toFixed(0)}% below the industry average for this metric. This is an area worth reviewing to identify improvement opportunities.`
            : `${org.name} is performing at the industry average for this metric (within +/-5%). Performance is tracking in line with peers.`

      return h(Page, { key: b.id, size: 'A4', style: styles.page },
        h(View, { style: styles.pageHeader },
          h(View, null,
            h(Text, { style: styles.pageHeaderTitle }, 'Metric Detail'),
            h(Text, { style: styles.pageHeaderSub }, `${org.name}  ·  ${b.pillar}  ·  ${b.period}`),
          ),
          h(Text, { style: { fontSize: 10, color: SUNDAY, fontFamily: 'Helvetica-Bold' } }, `${idx + 1} / ${benchmarks.length}`),
        ),

        // Metric name header
        h(View, { style: [styles.sectionHeader, { marginBottom: 20 }] },
          h(Text, { style: styles.sectionHeaderText }, label),
        ),

        // Stats grid
        h(View, { style: { flexDirection: 'row', gap: 12, marginBottom: 24 } },
          h(View, { style: [styles.statCard, { backgroundColor: hasMine ? '#EFF6FF' : LIGHT, flex: 1.5 }] },
            h(Text, { style: [styles.statNum, { fontSize: 22, color: hasMine ? NAVY : '#9CA3AF' }] },
              hasMine ? formatValue(myValue, unit) : '—'),
            h(Text, { style: styles.statLabel }, 'Your Organisation'),
          ),
          h(View, { style: [styles.statCard, { backgroundColor: '#F0FDFA' }] },
            h(Text, { style: [styles.statNum, { fontSize: 22, color: SUNDAY }] }, formatValue(avgVal, unit)),
            h(Text, { style: styles.statLabel }, 'Industry Average'),
          ),
          h(View, { style: [styles.statCard, { backgroundColor: '#FFFBEB' }] },
            h(Text, { style: [styles.statNum, { fontSize: 22, color: AMBER }] }, formatValue(p75Val, unit)),
            h(Text, { style: styles.statLabel }, 'Top Quartile (P75)'),
          ),
        ),

        // Visual bars
        h(View, { style: { marginBottom: 20 } },
          hasMine && h(View, { style: styles.barRow },
            h(Text, { style: styles.barLabel }, 'Your Org'),
            h(View, { style: styles.barTrack },
              h(View, { style: [styles.barFill, { backgroundColor: NAVY, width: `${Math.min(100, (myValue / maxVal) * 100)}%` }] }),
            ),
            h(Text, { style: { fontSize: 9, color: NAVY, fontFamily: 'Helvetica-Bold', width: 50 } },
              formatValue(myValue, unit)),
          ),
          h(View, { style: styles.barRow },
            h(Text, { style: styles.barLabel }, 'Industry Avg'),
            h(View, { style: styles.barTrack },
              h(View, { style: [styles.barFill, { backgroundColor: SUNDAY, width: `${Math.min(100, (avgVal / maxVal) * 100)}%` }] }),
            ),
            h(Text, { style: { fontSize: 9, color: SUNDAY, width: 50 } }, formatValue(avgVal, unit)),
          ),
          h(View, { style: styles.barRow },
            h(Text, { style: styles.barLabel }, 'Top Quartile'),
            h(View, { style: styles.barTrack },
              h(View, { style: [styles.barFill, { backgroundColor: AMBER, width: `${Math.min(100, (p75Val / maxVal) * 100)}%` }] }),
            ),
            h(Text, { style: { fontSize: 9, color: AMBER, width: 50 } }, formatValue(p75Val, unit)),
          ),
          p25Val && h(View, { style: styles.barRow },
            h(Text, { style: styles.barLabel }, 'Bottom Quartile'),
            h(View, { style: styles.barTrack },
              h(View, { style: [styles.barFill, { backgroundColor: '#E5E7EB', width: `${Math.min(100, (p25Val / maxVal) * 100)}%` }] }),
            ),
            h(Text, { style: { fontSize: 9, color: '#9CA3AF', width: 50 } }, formatValue(p25Val, unit)),
          ),
        ),

        // Insight box
        hasMine
          ? h(View, { style: { padding: 16, backgroundColor: LIGHT, borderRadius: 8, borderLeft: `4 solid ${quartileColor}` } },
              h(View, { style: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 } },
                h(Text, { style: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: quartileColor } }, quartile),
              ),
              h(Text, { style: { fontSize: 10, color: '#4B5563', lineHeight: 1.6 } },
                insightText
              ),
              h(Text, { style: { fontSize: 9, color: '#9CA3AF', marginTop: 8 } },
                `Sample size: ${b.sampleSize} organisations  ·  Period: ${b.period}`),
            )
          : h(View, { style: { padding: 16, backgroundColor: LIGHT, borderRadius: 8 } },
              h(Text, { style: { fontSize: 10, color: '#9CA3AF', textAlign: 'center' } },
                'No data submitted for this metric.\nVisit the ABEA National Data Hub to submit your data.'),
            ),

        // Footer
        h(View, { style: styles.pageFooter },
          h(Text, { style: styles.footerText }, `Generated ${dateGenerated}  ·  ABEA National Data Hub`),
          h(Text, { style: styles.footerText }, `Page ${idx + 4}`),
        ),
      )
    }),
  )

  const buffer = await renderToBuffer(doc)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="abea-benchmark-report.pdf"',
      'Cache-Control': 'no-store',
    },
  })
}
