import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateMetricInputs, validatePeriod, validationSummary } from '@/lib/dataValidation'
import { parse } from 'csv-parse/sync'
import { SubmissionStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const period = formData.get('period') as string

    if (!file) return NextResponse.json({ error: 'CSV file is required.' }, { status: 400 })
    const periodIssues = validatePeriod(period)
    if (periodIssues.length > 0) {
      return NextResponse.json({ error: validationSummary(periodIssues), issues: periodIssues }, { status: 400 })
    }

    const org = await prisma.organisation.findUnique({ where: { id: session.orgId } })
    if (!org || !org.isApproved) return NextResponse.json({ error: 'Organisation not approved' }, { status: 403 })

    const text = await file.text()
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<{
      metric_code: string
      value: string
      period?: string
      notes?: string
    }>

    const metricDefs = await prisma.metricDefinition.findMany({ where: { pillar: org.pillar, isCore: true } })
    const metricByCode = Object.fromEntries(metricDefs.map(m => [m.code, m]))
    const inputs = records
      .map((record, index) => ({
        code: record.metric_code,
        value: record.value,
        period: record.period,
        row: index + 2,
      }))
      .filter(record => String(record.value ?? '').trim() !== '')

    if (inputs.length === 0) {
      return NextResponse.json({ error: 'CSV has no rows with metric values.' }, { status: 400 })
    }

    const { values, issues } = validateMetricInputs(inputs, metricDefs, period)
    if (issues.length > 0) {
      await prisma.importBatch.create({
        data: {
          filename: file.name,
          status: 'REJECTED',
          period,
          pillar: org.pillar,
          orgId: org.id,
          uploadedById: session.userId,
          rowCount: records.length,
          acceptedRows: 0,
          rejectedRows: issues.length,
          validationSummary: issues,
        },
      })
      return NextResponse.json({ error: validationSummary(issues), issues }, { status: 400 })
    }

    const rawData = Object.fromEntries(values.map(({ code, value }) => [code, value]))

    const submission = await prisma.$transaction(async tx => {
      const batch = await tx.importBatch.create({
        data: {
          filename: file.name,
          status: 'ACCEPTED',
          period,
          pillar: org.pillar,
          orgId: org.id,
          uploadedById: session.userId,
          rowCount: records.length,
          acceptedRows: values.length,
          rejectedRows: 0,
        },
      })
      const created = await tx.dataSubmission.create({
        data: {
          orgId: org.id,
          pillar: org.pillar,
          period,
          status: SubmissionStatus.SUBMITTED,
          rawData,
          mappedData: rawData,
          importBatchId: batch.id,
        },
      })

      await tx.submissionAuditEvent.create({
        data: {
          submissionId: created.id,
          action: 'CSV_UPLOADED',
          actorId: session.userId,
          note: `${file.name} accepted with ${values.length} metric value${values.length === 1 ? '' : 's'}.`,
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

    return NextResponse.json({ submissionId: submission.id, recordsProcessed: values.length }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
