import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orgs = await prisma.organisation.findMany({
    include: { _count: { select: { users: true, submissions: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orgs)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, isApproved } = await req.json()
  const org = await prisma.organisation.update({ where: { id }, data: { isApproved } })
  return NextResponse.json(org)
}
