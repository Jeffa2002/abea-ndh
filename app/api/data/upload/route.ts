import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'
import { SubmissionStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const period = formData.get('period') as string

    if (!file || !period) return NextResponse.json({ error: 'file and period required' }, { status: 400 })

    const org = await prisma.organisation.findUnique({ where: { id: session.orgId } })
    if (!org || !org.isApproved) return NextResponse.json({ error: 'Organisation not approved' }, { status: 403 })

    const text = await file.text()
    const records = parse(text, { columns: true, skip_empty_lines: true }) as Array<{
      metric_code: string
      value: string
      period?: string
      notes?: string
    }>

    const metricDefs = await prisma.metricDefinition.findMany({ where: { pillar: org.pillar } })
    const metricByCode = Object.fromEntries(metricDefs.map(m => [m.code, m]))

    const validRecords = records.filter(r => metricByCode[r.metric_code])
    if (validRecords.length === 0) {
      return NextResponse.json({ error: 'No valid metric codes found for your pillar' }, { status: 400 })
    }

    const rawData = Object.fromEntries(validRecords.map(r => [r.metric_code, parseFloat(r.value)]))

    const submission = await prisma.dataSubmission.create({
      data: {
        orgId: org.id,
        pillar: org.pillar,
        period,
        status: SubmissionStatus.SUBMITTED,
        rawData,
        mappedData: rawData,
      },
    })

    for (const r of validRecords) {
      const metric = metricByCode[r.metric_code]
      await prisma.metricValue.create({
        data: {
          submissionId: submission.id,
          metricId: metric.id,
          value: parseFloat(r.value),
          period,
        },
      })
    }

    return NextResponse.json({ submissionId: submission.id, recordsProcessed: validRecords.length }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
