import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateMetricInputs, validatePeriod, validationSummary } from '@/lib/dataValidation'
import { SubmissionStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { period, metrics } = await req.json()
    const periodIssues = validatePeriod(period)
    if (periodIssues.length > 0) {
      return NextResponse.json({ error: validationSummary(periodIssues), issues: periodIssues }, { status: 400 })
    }
    if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
      return NextResponse.json({ error: 'Submit at least one metric value.' }, { status: 400 })
    }

    const org = await prisma.organisation.findUnique({ where: { id: session.orgId } })
    if (!org || !org.isApproved) return NextResponse.json({ error: 'Organisation not approved' }, { status: 403 })

    const metricDefs = await prisma.metricDefinition.findMany({ where: { pillar: org.pillar, isCore: true } })
    const metricByCode = Object.fromEntries(metricDefs.map(m => [m.code, m]))
    const inputs = Object.entries(metrics).map(([code, value]) => ({ code, value }))
    const { values, issues } = validateMetricInputs(inputs, metricDefs, period)

    if (issues.length > 0) {
      return NextResponse.json({ error: validationSummary(issues), issues }, { status: 400 })
    }

    const cleanMetrics = Object.fromEntries(values.map(({ code, value }) => [code, value]))

    const submission = await prisma.$transaction(async tx => {
      const created = await tx.dataSubmission.create({
        data: {
          orgId: org.id,
          pillar: org.pillar,
          period,
          status: SubmissionStatus.SUBMITTED,
          rawData: cleanMetrics,
          mappedData: cleanMetrics,
        },
      })

      await tx.submissionAuditEvent.create({
        data: {
          submissionId: created.id,
          action: 'SUBMITTED',
          actorId: session.userId,
          note: `Manual submission received with ${values.length} metric value${values.length === 1 ? '' : 's'}.`,
        },
      })

      for (const { code, value } of values) {
        const metric = metricByCode[code]
        await tx.metricValue.create({
          data: {
            submissionId: created.id,
            metricId: metric.id,
            value,
            period,
          },
        })
      }

      return created
    })

    return NextResponse.json({ submissionId: submission.id }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
