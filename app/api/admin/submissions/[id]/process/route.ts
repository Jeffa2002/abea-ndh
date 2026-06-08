import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SubmissionStatus } from '@prisma/client'

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => ({})) as { note?: string }
  const submission = await prisma.dataSubmission.findUnique({
    where: { id },
    include: { _count: { select: { metrics: true } } },
  })

  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  if (submission._count.metrics === 0) {
    return NextResponse.json({ error: 'Submission has no metric values to process.' }, { status: 400 })
  }

  const updated = await prisma.dataSubmission.update({
    where: { id },
    data: {
      status: SubmissionStatus.PROCESSED,
      processedAt: new Date(),
      reviewedAt: new Date(),
      reviewedById: session.userId,
      reviewNote: body.note?.trim() || null,
    },
    include: { org: true, _count: { select: { metrics: true } } },
  })

  return NextResponse.json(updated)
}
