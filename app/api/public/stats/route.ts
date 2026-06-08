import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [orgCount, submissionCount, metricsTracked] = await Promise.all([
      prisma.organisation.count(),
      prisma.dataSubmission.count(),
      prisma.metricDefinition.count(),
    ])

    return NextResponse.json({
      orgCount,
      submissionCount,
      metricsTracked,
    })
  } catch {
    // Fallback to static values if DB unavailable
    return NextResponse.json({
      orgCount: 12,
      submissionCount: 47,
      metricsTracked: 28,
    })
  }
}
