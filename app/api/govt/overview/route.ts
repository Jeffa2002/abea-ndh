import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session || !['ADMIN', 'GOVT_VIEWER'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pillars = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU'] as const

  const overview = await Promise.all(
    pillars.map(async (pillar) => {
      const snapshots = await prisma.benchmarkSnapshot.findMany({
        where: { pillar, period: '2024-FY' },
      })
      const orgCount = await prisma.organisation.count({ where: { pillar, isApproved: true } })
      return { pillar, orgCount, snapshots }
    })
  )

  const economicImpact = await prisma.benchmarkSnapshot.findFirst({
    where: { metricCode: 'BUR_ECONOMIC_IMPACT', period: '2024-FY' },
  })

  return NextResponse.json({ overview, economicImpact })
}
