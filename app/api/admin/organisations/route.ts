import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { REPORTING_DIMENSIONS, cleanDimension } from '@/lib/reportingDimensions'

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

  const body = await req.json()
  const {
    id,
    isApproved,
    region,
    tier,
    reportingCohort,
    primaryEventType,
    capacityBand,
    governmentProgram,
  } = body as Record<string, unknown>

  if (typeof id !== 'string') return NextResponse.json({ error: 'Organisation id is required.' }, { status: 400 })

  const dimensionUpdates = {
    region: cleanDimension(region, REPORTING_DIMENSIONS.regions),
    tier: cleanDimension(tier, REPORTING_DIMENSIONS.tiers),
    reportingCohort: cleanDimension(reportingCohort, REPORTING_DIMENSIONS.cohorts),
    primaryEventType: cleanDimension(primaryEventType, REPORTING_DIMENSIONS.eventTypes),
    capacityBand: cleanDimension(capacityBand, REPORTING_DIMENSIONS.capacityBands),
    governmentProgram: cleanDimension(governmentProgram, REPORTING_DIMENSIONS.governmentPrograms),
  }

  if (Object.entries(dimensionUpdates).some(([key, value]) => key in body && value === undefined)) {
    return NextResponse.json({ error: 'One or more reporting dimensions are not in the controlled list.' }, { status: 400 })
  }

  const org = await prisma.organisation.update({
    where: { id },
    data: {
      ...(typeof isApproved === 'boolean' ? { isApproved } : {}),
      ...Object.fromEntries(Object.entries(dimensionUpdates).filter(([, value]) => value !== undefined)),
    },
  })
  return NextResponse.json(org)
}
