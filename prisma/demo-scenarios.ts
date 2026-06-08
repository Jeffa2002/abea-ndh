import { Prisma, PrismaClient, Pillar, SubmissionStatus } from '@prisma/client'

const prisma = new PrismaClient()

const periods = ['2023-FY', '2024-FY', '2025-H1']

const demoOrgs = [
  { name: 'Melbourne Convention Centre', slug: 'melbourne-convention-centre', pillar: Pillar.VENUE, region: 'VIC', tier: 'Large', reportingCohort: 'Pilot participant', primaryEventType: 'Conference', capacityBand: '7,500+', governmentProgram: 'State program' },
  { name: 'Perth Exhibition Precinct', slug: 'perth-exhibition-precinct', pillar: Pillar.VENUE, region: 'WA', tier: 'Mid', reportingCohort: 'Regional contributor', primaryEventType: 'Exhibition', capacityBand: '3,000-7,499', governmentProgram: 'Regional tourism program' },
  { name: 'Brisbane Business Events Campus', slug: 'brisbane-business-events-campus', pillar: Pillar.VENUE, region: 'QLD', tier: 'Large', reportingCohort: 'Strategic partner', primaryEventType: 'Mixed portfolio', capacityBand: '7,500+', governmentProgram: 'State program' },
  { name: 'National Congress Group', slug: 'national-congress-group', pillar: Pillar.ORGANISER, region: 'NSW', tier: 'Enterprise', reportingCohort: 'Foundation member', primaryEventType: 'Association event', capacityBand: '1,000-2,999', governmentProgram: 'Federal program' },
  { name: 'Summit Events Collective', slug: 'summit-events-collective', pillar: Pillar.ORGANISER, region: 'VIC', tier: 'Mid', reportingCohort: 'Pilot participant', primaryEventType: 'Corporate meeting', capacityBand: '250-999', governmentProgram: 'State program' },
  { name: 'Asia Pacific Incentives Co', slug: 'asia-pacific-incentives-co', pillar: Pillar.ORGANISER, region: 'QLD', tier: 'SME', reportingCohort: 'Government program', primaryEventType: 'Incentive', capacityBand: '250-999', governmentProgram: 'Trade and investment program' },
  { name: 'Event Technology Partners', slug: 'event-technology-partners', pillar: Pillar.SUPPLIER, region: 'NSW', tier: 'Mid', reportingCohort: 'Foundation member', primaryEventType: 'Mixed portfolio', capacityBand: '1,000-2,999', governmentProgram: 'None' },
  { name: 'Sustainable Staging Australia', slug: 'sustainable-staging-australia', pillar: Pillar.SUPPLIER, region: 'SA', tier: 'SME', reportingCohort: 'Regional contributor', primaryEventType: 'Festival/business event', capacityBand: '250-999', governmentProgram: 'Regional tourism program' },
  { name: 'National Freight and Expo Services', slug: 'national-freight-expo-services', pillar: Pillar.SUPPLIER, region: 'National', tier: 'Enterprise', reportingCohort: 'Strategic partner', primaryEventType: 'Exhibition', capacityBand: '3,000-7,499', governmentProgram: 'Federal program' },
  { name: 'Business Events Sydney', slug: 'business-events-sydney', pillar: Pillar.BUREAU, region: 'NSW', tier: 'Large', reportingCohort: 'Foundation member', primaryEventType: 'Conference', capacityBand: '7,500+', governmentProgram: 'State program' },
  { name: 'Visit Canberra Business Events', slug: 'visit-canberra-business-events', pillar: Pillar.BUREAU, region: 'ACT', tier: 'Mid', reportingCohort: 'Government program', primaryEventType: 'Association event', capacityBand: '1,000-2,999', governmentProgram: 'State program' },
  { name: 'Northern Events Bureau', slug: 'northern-events-bureau', pillar: Pillar.BUREAU, region: 'NT', tier: 'Small', reportingCohort: 'Regional contributor', primaryEventType: 'Mixed portfolio', capacityBand: 'Under 250', governmentProgram: 'Regional tourism program' },
]

const baseValues: Record<Pillar, Record<string, number>> = {
  [Pillar.VENUE]: {
    VENUE_TOTAL_CAPACITY: 5200,
    VENUE_OCCUPANCY_RATE: 68,
    VENUE_EVENTS_HOSTED: 210,
    VENUE_AVG_EVENT_SIZE: 330,
    VENUE_REVENUE_PER_DELEGATE: 155,
    VENUE_LEAD_TIME_DAYS: 125,
  },
  [Pillar.ORGANISER]: {
    ORG_EVENTS_DELIVERED: 38,
    ORG_TOTAL_DELEGATES: 18500,
    ORG_DELEGATE_DIRECT_EVENT_SPEND: 38000000,
    ORG_INDIRECT_VISITOR_SPEND: 19000000,
    ORG_EVENT_AND_SHOULDER_DAYS: 5,
    ORG_ACCOMPANYING_GUESTS: 5200,
    ORG_EXHIBITING_COST: 1100000,
    ORG_NATIONAL_PARTICIPANT_PCT: 76,
    ORG_INTERNATIONAL_PARTICIPANT_PCT: 24,
    ORG_DIRECT_VIC_SPEND: 6200000,
  },
  [Pillar.SUPPLIER]: {
    SUP_ACTIVE_CONTRACTS: 30,
    SUP_AVG_CONTRACT_VALUE: 36000,
    SUP_CLIENT_RETENTION: 74,
    SUP_EVENTS_SERVICED: 130,
    SUP_AVG_LEAD_TIME: 25,
    SUP_REVENUE_GROWTH: 13,
  },
  [Pillar.BUREAU]: {
    BUR_BIDS_SUBMITTED: 18,
    BUR_BID_WIN_RATE: 48,
    BUR_ECONOMIC_IMPACT: 102000000,
    BUR_DELEGATE_NIGHTS: 34000,
    BUR_AVG_BID_VALUE: 5200000,
    BUR_INTL_EVENTS_WON: 6,
  },
}

function multiplier(orgIndex: number, periodIndex: number) {
  return 0.82 + (orgIndex % 5) * 0.09 + periodIndex * 0.08
}

function valueFor(code: string, base: number, orgIndex: number, periodIndex: number) {
  const raw = base * multiplier(orgIndex, periodIndex)
  if (code.includes('PCT') || code.includes('RATE') || code.includes('GROWTH') || code.includes('WIN')) {
    return Math.min(99, Math.round(raw * 10) / 10)
  }
  if (code.includes('DAYS') || code.includes('LEAD_TIME')) return Math.round(raw)
  return Math.round(raw)
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower)
}

async function recalculateBenchmarks() {
  for (const pillar of Object.values(Pillar)) {
    const metricDefs = await prisma.metricDefinition.findMany({ where: { pillar, isCore: true } })
    for (const metric of metricDefs) {
      const values = await prisma.metricValue.findMany({
        where: {
          metricId: metric.id,
          submission: {
            status: SubmissionStatus.PROCESSED,
            pillar,
            OR: [{ importBatchId: null }, { importBatch: { excludeFromReporting: false } }],
          },
        },
        select: { value: true, period: true },
      })
      for (const period of periods) {
        const vals = values.filter(value => value.period === period).map(value => value.value)
        if (vals.length < 2) continue
        const sorted = [...vals].sort((a, b) => a - b)
        const avg = vals.reduce((sum, value) => sum + value, 0) / vals.length
        await prisma.benchmarkSnapshot.deleteMany({
          where: { pillar, metricCode: metric.code, period, region: null, tier: null },
        })
        await prisma.benchmarkSnapshot.create({
          data: {
            pillar,
            metricCode: metric.code,
            period,
            avgValue: avg,
            medianValue: percentile(sorted, 50),
            p25Value: percentile(sorted, 25),
            p75Value: percentile(sorted, 75),
            sampleSize: vals.length,
          },
        })
      }
    }
  }
}

async function main() {
  console.log('Seeding demo reporting scenarios...')
  const metricDefs = await prisma.metricDefinition.findMany({ where: { isCore: true } })
  const metricByCode = Object.fromEntries(metricDefs.map(metric => [metric.code, metric]))

  const batches = new Map<string, Awaited<ReturnType<typeof prisma.importBatch.create>>>()
  for (const period of periods) {
    const existing = await prisma.importBatch.findFirst({ where: { filename: `demo-scenario-${period}.csv` } })
    const batch = existing || await prisma.importBatch.create({
      data: {
        filename: `demo-scenario-${period}.csv`,
        source: 'DEMO_SCENARIO',
        status: 'ACCEPTED',
        period,
        rowCount: 0,
        acceptedRows: 0,
        rejectedRows: 0,
      },
    })
    batches.set(period, batch)
  }

  for (const [orgIndex, demoOrg] of demoOrgs.entries()) {
    const org = await prisma.organisation.upsert({
      where: { slug: demoOrg.slug },
      update: { ...demoOrg, isApproved: true },
      create: { ...demoOrg, isApproved: true },
    })

    for (const [periodIndex, period] of periods.entries()) {
      const existing = await prisma.dataSubmission.findFirst({ where: { orgId: org.id, period } })
      if (existing) continue

      const values = Object.entries(baseValues[org.pillar]).map(([code, base]) => ({
        code,
        value: valueFor(code, base, orgIndex, periodIndex),
      }))
      const rawData = Object.fromEntries(values.map(row => [row.code, row.value])) as Prisma.JsonObject
      const reviewedAt = new Date()
      const batch = batches.get(period)

      await prisma.$transaction(async tx => {
        const submission = await tx.dataSubmission.create({
          data: {
            orgId: org.id,
            pillar: org.pillar,
            period,
            status: SubmissionStatus.PROCESSED,
            rawData,
            mappedData: rawData,
            processedAt: reviewedAt,
            reviewedAt,
            reviewNote: 'Demo scenario record generated for stakeholder reporting walkthroughs.',
            importBatchId: batch?.id,
          },
        })

        await tx.submissionAuditEvent.create({
          data: {
            submissionId: submission.id,
            action: 'DEMO_PROCESSED',
            note: 'Processed demo scenario submission for reporting walkthroughs.',
          },
        })

        for (const row of values) {
          const metric = metricByCode[row.code]
          if (!metric) continue
          await tx.metricValue.create({
            data: {
              submissionId: submission.id,
              metricId: metric.id,
              value: row.value,
              period,
            },
          })
        }
      })
    }
  }

  for (const period of periods) {
    const batch = batches.get(period)
    if (!batch) continue
    const rows = await prisma.metricValue.count({ where: { submission: { importBatchId: batch.id } } })
    const submissions = await prisma.dataSubmission.count({ where: { importBatchId: batch.id } })
    await prisma.importBatch.update({
      where: { id: batch.id },
      data: { rowCount: rows, acceptedRows: rows, rejectedRows: 0, status: 'ACCEPTED', validationSummary: { submissions } },
    })
  }

  await recalculateBenchmarks()
  console.log('Demo scenarios seeded and benchmarks recalculated.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
