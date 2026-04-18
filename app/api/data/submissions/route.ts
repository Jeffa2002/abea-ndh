import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session || !session.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const submissions = await prisma.dataSubmission.findMany({
    where: { orgId: session.orgId },
    orderBy: { createdAt: 'desc' },
    include: { metrics: { include: { metric: true } } },
  })

  return NextResponse.json(submissions)
}
