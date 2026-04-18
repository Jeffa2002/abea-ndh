import { PrismaClient, Pillar, UserRole, SubmissionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Admin user (no org)
  const adminHash = await bcrypt.hash('Admin2026!', 10)
  await prisma.user.upsert({
    where: { email: 'admin@abea.org.au' },
    update: {},
    create: {
      email: 'admin@abea.org.au',
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
  })

  // Govt viewer
  const govtHash = await bcrypt.hash('Govt2026!', 10)
  await prisma.user.upsert({
    where: { email: 'viewer@austrade.gov.au' },
    update: {},
    create: {
      email: 'viewer@austrade.gov.au',
      passwordHash: govtHash,
      role: UserRole.GOVT_VIEWER,
    },
  })

  // Metric Definitions
  const metrics = [
    // VENUE
    { pillar: Pillar.VENUE, code: 'VENUE_TOTAL_CAPACITY', label: 'Total Capacity', unit: 'count', description: 'Maximum delegate capacity across all spaces' },
    { pillar: Pillar.VENUE, code: 'VENUE_OCCUPANCY_RATE', label: 'Occupancy Rate', unit: 'percent', description: 'Average space utilisation rate' },
    { pillar: Pillar.VENUE, code: 'VENUE_EVENTS_HOSTED', label: 'Events Hosted', unit: 'count', description: 'Total events hosted in period' },
    { pillar: Pillar.VENUE, code: 'VENUE_AVG_EVENT_SIZE', label: 'Avg Event Size', unit: 'count', description: 'Average delegates per event' },
    { pillar: Pillar.VENUE, code: 'VENUE_REVENUE_PER_DELEGATE', label: 'Revenue per Delegate', unit: 'AUD', description: 'Average venue revenue per delegate' },
    { pillar: Pillar.VENUE, code: 'VENUE_LEAD_TIME_DAYS', label: 'Lead Time', unit: 'days', description: 'Average booking lead time in days' },
    // ORGANISER
    { pillar: Pillar.ORGANISER, code: 'ORG_EVENTS_DELIVERED', label: 'Events Delivered', unit: 'count', description: 'Total events delivered in period' },
    { pillar: Pillar.ORGANISER, code: 'ORG_TOTAL_DELEGATES', label: 'Total Delegates', unit: 'count', description: 'Total delegates across all events' },
    { pillar: Pillar.ORGANISER, code: 'ORG_AVG_EVENT_BUDGET', label: 'Avg Event Budget', unit: 'AUD', description: 'Average budget per event' },
    { pillar: Pillar.ORGANISER, code: 'ORG_DELEGATE_SPEND', label: 'Delegate Spend', unit: 'AUD', description: 'Average spend per delegate' },
    { pillar: Pillar.ORGANISER, code: 'ORG_INTL_DELEGATE_PCT', label: 'Intl Delegate %', unit: 'percent', description: 'Percentage of international delegates' },
    { pillar: Pillar.ORGANISER, code: 'ORG_REPEAT_CLIENT_RATE', label: 'Repeat Client Rate', unit: 'percent', description: 'Percentage of repeat clients' },
    // SUPPLIER
    { pillar: Pillar.SUPPLIER, code: 'SUP_ACTIVE_CONTRACTS', label: 'Active Contracts', unit: 'count', description: 'Number of active client contracts' },
    { pillar: Pillar.SUPPLIER, code: 'SUP_AVG_CONTRACT_VALUE', label: 'Avg Contract Value', unit: 'AUD', description: 'Average value per contract' },
    { pillar: Pillar.SUPPLIER, code: 'SUP_CLIENT_RETENTION', label: 'Client Retention', unit: 'percent', description: 'Client retention rate' },
    { pillar: Pillar.SUPPLIER, code: 'SUP_EVENTS_SERVICED', label: 'Events Serviced', unit: 'count', description: 'Total events serviced in period' },
    { pillar: Pillar.SUPPLIER, code: 'SUP_AVG_LEAD_TIME', label: 'Avg Lead Time', unit: 'days', description: 'Average engagement lead time' },
    { pillar: Pillar.SUPPLIER, code: 'SUP_REVENUE_GROWTH', label: 'Revenue Growth', unit: 'percent', description: 'Year-on-year revenue growth' },
    // BUREAU
    { pillar: Pillar.BUREAU, code: 'BUR_BIDS_SUBMITTED', label: 'Bids Submitted', unit: 'count', description: 'Total bids submitted in period' },
    { pillar: Pillar.BUREAU, code: 'BUR_BID_WIN_RATE', label: 'Bid Win Rate', unit: 'percent', description: 'Percentage of bids won' },
    { pillar: Pillar.BUREAU, code: 'BUR_ECONOMIC_IMPACT', label: 'Economic Impact', unit: 'AUD', description: 'Total estimated economic impact' },
    { pillar: Pillar.BUREAU, code: 'BUR_DELEGATE_NIGHTS', label: 'Delegate Nights', unit: 'count', description: 'Total delegate nights generated' },
    { pillar: Pillar.BUREAU, code: 'BUR_AVG_BID_VALUE', label: 'Avg Bid Value', unit: 'AUD', description: 'Average estimated value per bid' },
    { pillar: Pillar.BUREAU, code: 'BUR_INTL_EVENTS_WON', label: 'Intl Events Won', unit: 'count', description: 'International events won' },
  ]

  for (const m of metrics) {
    await prisma.metricDefinition.upsert({
      where: { code: m.code },
      update: {},
      create: m,
    })
  }
  console.log('Metrics seeded')

  // Demo Organisations
  const orgs = [
    { name: 'Sydney ICC', slug: 'sydney-icc', pillar: Pillar.VENUE, region: 'NSW', tier: 'Large' },
    { name: 'Events Australia Pty Ltd', slug: 'events-australia', pillar: Pillar.ORGANISER, region: 'VIC', tier: 'Mid' },
    { name: 'AV Solutions Group', slug: 'av-solutions', pillar: Pillar.SUPPLIER, region: 'QLD', tier: 'SME' },
    { name: 'Business Events Melbourne', slug: 'be-melbourne', pillar: Pillar.BUREAU, region: 'VIC', tier: 'Large' },
  ]

  const createdOrgs: Record<string, any> = {}
  for (const o of orgs) {
    const org = await prisma.organisation.upsert({
      where: { slug: o.slug },
      update: {},
      create: { ...o, isApproved: true },
    })
    createdOrgs[o.slug] = org

    const memberHash = await bcrypt.hash('Member2026!', 10)
    const email = `member@${o.slug}.com.au`
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: memberHash,
        role: UserRole.MEMBER,
        orgId: org.id,
      },
    })
  }
  console.log('Organisations and members seeded')

  // Submission data per org
  const submissionData: Record<string, Record<string, number>> = {
    'sydney-icc': {
      VENUE_TOTAL_CAPACITY: 8000,
      VENUE_OCCUPANCY_RATE: 72,
      VENUE_EVENTS_HOSTED: 312,
      VENUE_AVG_EVENT_SIZE: 450,
      VENUE_REVENUE_PER_DELEGATE: 185,
      VENUE_LEAD_TIME_DAYS: 142,
    },
    'events-australia': {
      ORG_EVENTS_DELIVERED: 48,
      ORG_TOTAL_DELEGATES: 24800,
      ORG_AVG_EVENT_BUDGET: 185000,
      ORG_DELEGATE_SPEND: 2400,
      ORG_INTL_DELEGATE_PCT: 28,
      ORG_REPEAT_CLIENT_RATE: 64,
    },
    'av-solutions': {
      SUP_ACTIVE_CONTRACTS: 34,
      SUP_AVG_CONTRACT_VALUE: 42000,
      SUP_CLIENT_RETENTION: 78,
      SUP_EVENTS_SERVICED: 156,
      SUP_AVG_LEAD_TIME: 21,
      SUP_REVENUE_GROWTH: 18,
    },
    'be-melbourne': {
      BUR_BIDS_SUBMITTED: 22,
      BUR_BID_WIN_RATE: 54,
      BUR_ECONOMIC_IMPACT: 142000000,
      BUR_DELEGATE_NIGHTS: 48600,
      BUR_AVG_BID_VALUE: 6500000,
      BUR_INTL_EVENTS_WON: 8,
    },
  }

  const allMetricDefs = await prisma.metricDefinition.findMany()
  const metricByCode = Object.fromEntries(allMetricDefs.map(m => [m.code, m]))

  for (const [slug, data] of Object.entries(submissionData)) {
    const org = createdOrgs[slug]
    const existing = await prisma.dataSubmission.findFirst({ where: { orgId: org.id, period: '2024-FY' } })
    if (existing) continue

    const submission = await prisma.dataSubmission.create({
      data: {
        orgId: org.id,
        pillar: org.pillar,
        period: '2024-FY',
        status: SubmissionStatus.PROCESSED,
        rawData: data as any,
        mappedData: data as any,
        processedAt: new Date(),
      },
    })

    for (const [code, value] of Object.entries(data)) {
      const metric = metricByCode[code]
      if (metric) {
        await prisma.metricValue.create({
          data: {
            submissionId: submission.id,
            metricId: metric.id,
            value,
            period: '2024-FY',
          },
        })
      }
    }
  }
  console.log('Submissions seeded')

  // Benchmark Snapshots (simulated from multiple orgs)
  const benchmarkData = [
    // VENUE benchmarks
    { pillar: Pillar.VENUE, metricCode: 'VENUE_TOTAL_CAPACITY', period: '2024-FY', avgValue: 4200, medianValue: 3800, p25Value: 1500, p75Value: 6500, sampleSize: 12 },
    { pillar: Pillar.VENUE, metricCode: 'VENUE_OCCUPANCY_RATE', period: '2024-FY', avgValue: 65, medianValue: 67, p25Value: 54, p75Value: 76, sampleSize: 12 },
    { pillar: Pillar.VENUE, metricCode: 'VENUE_EVENTS_HOSTED', period: '2024-FY', avgValue: 185, medianValue: 160, p25Value: 80, p75Value: 280, sampleSize: 12 },
    { pillar: Pillar.VENUE, metricCode: 'VENUE_AVG_EVENT_SIZE', period: '2024-FY', avgValue: 280, medianValue: 240, p25Value: 120, p75Value: 420, sampleSize: 12 },
    { pillar: Pillar.VENUE, metricCode: 'VENUE_REVENUE_PER_DELEGATE', period: '2024-FY', avgValue: 145, medianValue: 138, p25Value: 95, p75Value: 195, sampleSize: 12 },
    { pillar: Pillar.VENUE, metricCode: 'VENUE_LEAD_TIME_DAYS', period: '2024-FY', avgValue: 118, medianValue: 110, p25Value: 75, p75Value: 160, sampleSize: 12 },
    // ORGANISER benchmarks
    { pillar: Pillar.ORGANISER, metricCode: 'ORG_EVENTS_DELIVERED', period: '2024-FY', avgValue: 32, medianValue: 28, p25Value: 15, p75Value: 48, sampleSize: 9 },
    { pillar: Pillar.ORGANISER, metricCode: 'ORG_TOTAL_DELEGATES', period: '2024-FY', avgValue: 16500, medianValue: 14000, p25Value: 6000, p75Value: 25000, sampleSize: 9 },
    { pillar: Pillar.ORGANISER, metricCode: 'ORG_AVG_EVENT_BUDGET', period: '2024-FY', avgValue: 125000, medianValue: 110000, p25Value: 65000, p75Value: 180000, sampleSize: 9 },
    { pillar: Pillar.ORGANISER, metricCode: 'ORG_DELEGATE_SPEND', period: '2024-FY', avgValue: 1950, medianValue: 1800, p25Value: 1200, p75Value: 2600, sampleSize: 9 },
    { pillar: Pillar.ORGANISER, metricCode: 'ORG_INTL_DELEGATE_PCT', period: '2024-FY', avgValue: 22, medianValue: 20, p25Value: 12, p75Value: 32, sampleSize: 9 },
    { pillar: Pillar.ORGANISER, metricCode: 'ORG_REPEAT_CLIENT_RATE', period: '2024-FY', avgValue: 55, medianValue: 56, p25Value: 42, p75Value: 68, sampleSize: 9 },
    // SUPPLIER benchmarks
    { pillar: Pillar.SUPPLIER, metricCode: 'SUP_ACTIVE_CONTRACTS', period: '2024-FY', avgValue: 28, medianValue: 25, p25Value: 12, p75Value: 42, sampleSize: 8 },
    { pillar: Pillar.SUPPLIER, metricCode: 'SUP_AVG_CONTRACT_VALUE', period: '2024-FY', avgValue: 35000, medianValue: 32000, p25Value: 18000, p75Value: 52000, sampleSize: 8 },
    { pillar: Pillar.SUPPLIER, metricCode: 'SUP_CLIENT_RETENTION', period: '2024-FY', avgValue: 72, medianValue: 74, p25Value: 60, p75Value: 84, sampleSize: 8 },
    { pillar: Pillar.SUPPLIER, metricCode: 'SUP_EVENTS_SERVICED', period: '2024-FY', avgValue: 120, medianValue: 108, p25Value: 55, p75Value: 175, sampleSize: 8 },
    { pillar: Pillar.SUPPLIER, metricCode: 'SUP_AVG_LEAD_TIME', period: '2024-FY', avgValue: 26, medianValue: 24, p25Value: 14, p75Value: 38, sampleSize: 8 },
    { pillar: Pillar.SUPPLIER, metricCode: 'SUP_REVENUE_GROWTH', period: '2024-FY', avgValue: 12, medianValue: 11, p25Value: 5, p75Value: 19, sampleSize: 8 },
    // BUREAU benchmarks
    { pillar: Pillar.BUREAU, metricCode: 'BUR_BIDS_SUBMITTED', period: '2024-FY', avgValue: 16, medianValue: 14, p25Value: 8, p75Value: 24, sampleSize: 7 },
    { pillar: Pillar.BUREAU, metricCode: 'BUR_BID_WIN_RATE', period: '2024-FY', avgValue: 46, medianValue: 45, p25Value: 32, p75Value: 60, sampleSize: 7 },
    { pillar: Pillar.BUREAU, metricCode: 'BUR_ECONOMIC_IMPACT', period: '2024-FY', avgValue: 98000000, medianValue: 85000000, p25Value: 45000000, p75Value: 145000000, sampleSize: 7 },
    { pillar: Pillar.BUREAU, metricCode: 'BUR_DELEGATE_NIGHTS', period: '2024-FY', avgValue: 32000, medianValue: 28000, p25Value: 14000, p75Value: 48000, sampleSize: 7 },
    { pillar: Pillar.BUREAU, metricCode: 'BUR_AVG_BID_VALUE', period: '2024-FY', avgValue: 4800000, medianValue: 4200000, p25Value: 2100000, p75Value: 7200000, sampleSize: 7 },
    { pillar: Pillar.BUREAU, metricCode: 'BUR_INTL_EVENTS_WON', period: '2024-FY', avgValue: 5, medianValue: 5, p25Value: 2, p75Value: 8, sampleSize: 7 },
  ]

  for (const b of benchmarkData) {
    await prisma.benchmarkSnapshot.create({ data: b })
  }
  console.log('Benchmark snapshots seeded')

  console.log('\n✅ Seed complete!')
  console.log('Admin: admin@abea.org.au / Admin2026!')
  console.log('Govt:  viewer@austrade.gov.au / Govt2026!')
  console.log('Members: member@[org-slug].com.au / Member2026!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
