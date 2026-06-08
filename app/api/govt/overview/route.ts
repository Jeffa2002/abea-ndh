import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session || !['ADMIN', 'GOVT_VIEWER'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pillars = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU'] as const
  const url = new URL(req.url)
  const requestedPeriod = url.searchParams.get('period')
  const latestPeriod = await prisma.benchmarkSnapshot.findFirst({
    select: { period: true },
    orderBy: { period: 'desc' },
  })
  const period = requestedPeriod || latestPeriod?.period || '2024-FY'

  const overview = await Promise.all(
    pillars.map(async (pillar) => {
      const coreMetrics = await prisma.metricDefinition.findMany({
        where: { pillar, isCore: true },
        select: { code: true },
      })
      const snapshots = await prisma.benchmarkSnapshot.findMany({
        where: {
          pillar,
          period,
          metricCode: { in: coreMetrics.map(metric => metric.code) },
        },
      })
      const orgCount = await prisma.organisation.count({ where: { pillar, isApproved: true } })
      return { pillar, orgCount, snapshots }
    })
  )

  const economicImpact = await prisma.benchmarkSnapshot.findFirst({
    where: { metricCode: 'BUR_ECONOMIC_IMPACT', period },
  })

  const [processedSubmissions, metricRows] = await Promise.all([
    prisma.dataSubmission.count({ where: { status: 'PROCESSED', period } }),
    prisma.metricValue.count({ where: { submission: { status: 'PROCESSED', period } } }),
  ])

  return NextResponse.json({ overview, economicImpact, period, processedSubmissions, metricRows })
}
