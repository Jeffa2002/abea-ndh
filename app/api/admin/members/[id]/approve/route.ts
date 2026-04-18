// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  await prisma.user.update({
    where: { id },
    data: {
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
      approvedById: session.userId,
      approvalNote: null,
    },
  })

  return NextResponse.json({ success: true })
}
