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
  const note = body.note?.trim()

  if (!note) {
    return NextResponse.json({ error: 'A rejection note is required.' }, { status: 400 })
  }

  const submission = await prisma.dataSubmission.findUnique({ where: { id } })
  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

  const updated = await prisma.dataSubmission.update({
    where: { id },
    data: {
      status: SubmissionStatus.ERROR,
      reviewedAt: new Date(),
      reviewedById: session.userId,
      reviewNote: note,
    },
    include: { org: true, _count: { select: { metrics: true } } },
  })

  return NextResponse.json(updated)
}
