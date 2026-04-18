import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const snapshots = await prisma.benchmarkSnapshot.findMany({
    orderBy: [{ pillar: 'asc' }, { metricCode: 'asc' }],
  })
  return NextResponse.json(snapshots)
}
