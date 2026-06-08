import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPillar } from '@/lib/brand'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const requestedPillar = searchParams.get('pillar') || session.pillar
  const pillar = isPillar(requestedPillar) ? requestedPillar : undefined
  const period = searchParams.get('period') || '2024-FY'
  const coreMetrics = await prisma.metricDefinition.findMany({
    where: { ...(pillar ? { pillar } : {}), isCore: true },
    select: { code: true },
  })

  const snapshots = await prisma.benchmarkSnapshot.findMany({
    where: {
      ...(pillar ? { pillar } : {}),
      period,
      metricCode: { in: coreMetrics.map(metric => metric.code) },
    },
    orderBy: { metricCode: 'asc' },
  })

  return NextResponse.json(snapshots)
}
