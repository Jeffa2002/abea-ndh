import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => ({})) as { exclude?: boolean; note?: string }
  const exclude = body.exclude !== false
  const note = body.note?.trim() || null

  const batch = await prisma.importBatch.update({
    where: { id },
    data: {
      excludeFromReporting: exclude,
      exclusionNote: exclude ? note : null,
      excludedAt: exclude ? new Date() : null,
      excludedById: exclude ? session.userId : null,
    },
    include: { _count: { select: { submissions: true } } },
  })

  return NextResponse.json(batch)
}
