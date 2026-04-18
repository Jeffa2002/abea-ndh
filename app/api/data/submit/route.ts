import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubmissionStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { period, metrics } = await req.json()
    if (!period || !metrics) return NextResponse.json({ error: 'period and metrics required' }, { status: 400 })

    const org = await prisma.organisation.findUnique({ where: { id: session.orgId } })
    if (!org || !org.isApproved) return NextResponse.json({ error: 'Organisation not approved' }, { status: 403 })

    const metricDefs = await prisma.metricDefinition.findMany({ where: { pillar: org.pillar } })
    const metricByCode = Object.fromEntries(metricDefs.map(m => [m.code, m]))

    const submission = await prisma.dataSubmission.create({
      data: {
        orgId: org.id,
        pillar: org.pillar,
        period,
        status: SubmissionStatus.SUBMITTED,
        rawData: metrics,
        mappedData: metrics,
      },
    })

    for (const [code, value] of Object.entries(metrics)) {
      const metric = metricByCode[code]
      if (metric && typeof value === 'number') {
        await prisma.metricValue.create({
          data: {
            submissionId: submission.id,
            metricId: metric.id,
            value,
            period,
          },
        })
      }
    }

    return NextResponse.json({ submissionId: submission.id }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
