import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const pillar = searchParams.get('pillar') || session.pillar
  const period = searchParams.get('period') || '2024-FY'

  const snapshots = await prisma.benchmarkSnapshot.findMany({
    where: { pillar: pillar as any, period },
    orderBy: { metricCode: 'asc' },
  })

  return NextResponse.json(snapshots)
}
