import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const pillar = searchParams.get('pillar') || session.pillar

  const metrics = await prisma.metricDefinition.findMany({
    where: pillar ? { pillar: pillar as any } : undefined,
    orderBy: { pillar: 'asc' },
  })

  return NextResponse.json(metrics)
}
