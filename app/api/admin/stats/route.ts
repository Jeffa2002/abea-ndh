import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [totalOrgs, byPillar, totalSubmissions, pendingApprovals, snapshots] = await Promise.all([
    prisma.organisation.count(),
    prisma.organisation.groupBy({ by: ['pillar'], _count: { id: true } }),
    prisma.dataSubmission.count(),
    prisma.organisation.count({ where: { isApproved: false } }),
    prisma.benchmarkSnapshot.count(),
  ])

  return NextResponse.json({ totalOrgs, byPillar, totalSubmissions, pendingApprovals, snapshots })
}
