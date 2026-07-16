import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const datasets = [
  {
    id: 'fc-intl-jul24', name: 'International Forward Calendar — July 2024', domain: 'FORWARD_CALENDAR', market: 'INTERNATIONAL', asOfLabel: 'July 2024',
    sourceFilename: 'AACB Forward Calendar Report - JUL24 - International.xlsx', sourceHash: 'd18af2dbf2262c638793a548fdae82f6b11b12efe8fa01d923e19ed1001473ed', rowCount: 256,
    validationSummary: { reportReconciliation: 'REVIEW_REQUIRED', warning: 'Published PDF headline totals do not reconcile with this supplied workbook version.', missingDestinationRows: 108 },
  },
  {
    id: 'fc-intl-jan25', name: 'International Forward Calendar — January 2025', domain: 'FORWARD_CALENDAR', market: 'INTERNATIONAL', asOfLabel: 'January 2025',
    sourceFilename: 'AACB Forward Calendar Report - JAN25 - International.xlsx', sourceHash: 'f9c735ad1656ae266e7716b54205ec126282808804091e6b36733a1ea33ec329', rowCount: 256,
    validationSummary: { reportReconciliation: 'PASSED_HEADLINES', missingDestinationRows: 102, wonReasonResponses: 178, lostReasonResponses: 227 },
  },
  {
    id: 'fc-dom-jul25', name: 'National Forward Calendar — July 2025', domain: 'FORWARD_CALENDAR', market: 'DOMESTIC', asOfLabel: 'July 2025',
    sourceFilename: 'ABEA Forward Calendar Report - JUL25 - National.xlsx', sourceHash: 'c4311a51d8844d100c12a35ea9fe4b7680f55ed9690823c30ef2a9f5217e2209', rowCount: 436,
    validationSummary: { reportReconciliation: 'PARTIAL', warning: 'Won headlines reconcile; pending headline values require review.', wonReasonResponses: 223, lostReasonResponses: 396 },
  },
  {
    id: 'commercial-eight-shows', name: 'Eight-show commercial scenario', domain: 'COMMERCIAL', market: 'DEIDENTIFIED', asOfLabel: 'Scenario',
    sourceFilename: 'Dawid Data.xlsx', rowCount: 8, validationSummary: { reconciledRows: 8, caveat: 'No attendance, event type, floor area, revenue composition, overhead or date.' },
  },
  {
    id: 'commercial-three-events', name: 'Three-event financial scenario', domain: 'COMMERCIAL', market: 'DEIDENTIFIED', asOfLabel: 'Scenario',
    sourceFilename: 'Consolidated Events with Financials.xlsx', sourceHash: '600b83525d18ba8f8d5b5713c18dbf0f7d3017bca89aa5b23aa8a1f8def24a70', rowCount: 3,
    validationSummary: { registrationBalancesPassed: 3, missingSponsorshipRows: 1, caveat: 'Registration and other revenue categories are incomplete.' },
  },
  {
    id: 'bid-dummy-pilot', name: 'Dummy bid and prospect pilot', domain: 'BID_PIPELINE', market: 'DEIDENTIFIED', asOfLabel: 'Synthetic scenario',
    sourceFilename: 'BE dummy datasets pilot.xlsx', sourceHash: '4b5fa131c631d2a4375091e35d64284c1e08a8a97f9212cf760396a1f133ef93', rowCount: 170,
    validationSummary: { historicalOutcomes: 70, won: 50, lost: 20, prospects: 100, dateSequenceIssues: 10, warning: 'Synthetic data. Not approved for predictive modelling.', existingScoreWonAverage: 59.62, existingScoreLostAverage: 65.95 },
  },
]

const summaries = [
  ['fc-intl-jul24','WON',349,1673,204608,85612,290220,1015612,395412,1411041,635961471,207298631,843260102],
  ['fc-intl-jul24','LOST',259,1232,248082,101533,349615,1232927,490162,1723102,709197950,246955664,956153614],
  ['fc-intl-jul24','PENDING',262,1499,221637,84713,306350,1205275,389370,1594651,735132003,204831797,939963799],
  ['fc-intl-jan25','WON',352,1698,204903,93326,298229,1008761,411399,1420180,630332345,213108982,843441326],
  ['fc-intl-jan25','LOST',256,1215,266417,101959,368376,1302038,481960,1784010,764535739,246668992,1011204731],
  ['fc-intl-jan25','PENDING',236,1323,187388,76152,263540,984802,337772,1322585,588229956,175911493,764141448],
  ['fc-dom-jul25','WON',789,2989,31015,397216,428231,124786,1479569,1604370,67231029,690435801,757666830],
  ['fc-dom-jul25','LOST',454,1722,8901,230607,239508,35588,784426,820021,20430385,348520576,368950961],
  ['fc-dom-jul25','PENDING',773,341,21474,371355,392829,81998,466152,548159,43903557,271191676,315095234],
] as const

const reasons = [
  ['fc-intl-jul24','WON','Bid Team',33.6,64.85,193], ['fc-intl-jul24','WON','Destination / Geographic Preference',22.8,44.0,193], ['fc-intl-jul24','WON','Financial Package / Subvention',11.8,22.8,193], ['fc-intl-jul24','WON','Executive / Stakeholder Location',10.2,19.7,193], ['fc-intl-jul24','WON','Membership Base',8.6,16.6,193],
  ['fc-intl-jul24','LOST','Destination / Geographic Preference',28.8,63.1,219], ['fc-intl-jul24','LOST','Cost / Budget',13.2,28.9,219], ['fc-intl-jul24','LOST','Financial Package / Subvention',13.1,28.7,219], ['fc-intl-jul24','LOST','Executive / Stakeholder Location',11.0,24.1,219], ['fc-intl-jul24','LOST','Other',7.6,16.6,219],
  ['fc-intl-jan25','WON','Bid Team',32.2,57.33,178], ['fc-intl-jan25','WON','Destination / Geographic Preference',23.4,41.67,178], ['fc-intl-jan25','WON','Financial Package / Subvention',12.8,22.83,178], ['fc-intl-jan25','WON','Executive / Stakeholder Location',10.6,18.83,178], ['fc-intl-jan25','WON','Membership Base',7.8,13.83,178],
  ['fc-intl-jan25','LOST','Destination / Geographic Preference',30.3,68.67,227], ['fc-intl-jan25','LOST','Cost / Budget',11.0,25,227], ['fc-intl-jan25','LOST','Financial Package / Subvention',9.9,22.5,227], ['fc-intl-jan25','LOST','Rotation',9.3,21,227], ['fc-intl-jan25','LOST','Executive / Stakeholder Location',9.0,20.33,227],
  ['fc-dom-jul25','WON','Bid Team',27,60.21,223], ['fc-dom-jul25','WON','Financial Package / Subvention',24,53.52,223], ['fc-dom-jul25','WON','Destination / Geographic Preference',23,51.29,223], ['fc-dom-jul25','WON','Infrastructure & Services',8,17.84,223], ['fc-dom-jul25','WON','Rotation',8,17.84,223],
  ['fc-dom-jul25','LOST','Destination / Geographic Preference',36,142.56,396], ['fc-dom-jul25','LOST','Financial Package / Subvention',17,67.32,396], ['fc-dom-jul25','LOST','Other',13,51.48,396], ['fc-dom-jul25','LOST','Infrastructure & Services',8,31.68,396], ['fc-dom-jul25','LOST','Executive Influence',7,27.72,396],
] as const

const shows = [
  ['show-a',6300000,242000,640000,310000,260000,1452000,4848000], ['show-b',3060000,0,714000,265000,221000,1200000,1860000],
  ['show-c',1700000,30000,515000,328000,398000,1271000,429000], ['show-d',1400000,0,420000,260000,260000,940000,460000],
  ['show-e',6640000,0,1285000,231000,538000,2054000,4586000], ['show-f',2200000,0,1173000,320000,234000,1727000,473000],
  ['show-g',1635000,0,718000,182000,185000,1085000,550000], ['show-h',6970000,1070000,1424000,295000,230000,3019000,3951000],
] as const

const detailedEvents = [
  { id:'event-1',label:'Event 1',eventType:'Expo',sector:'Association',audience:'Executives',marketPositioning:'Regional',industry:'Transport',registrations:942,localRegistrations:267,interstateRegistrations:595,internationalRegistrations:80,venueSpend:469491.3745,cateringSpend:588986.33,marketingSpend:62000,sponsorshipRevenue:436491.4773,exhibitionRevenue:1660470.6091 },
  { id:'event-2',label:'Event 2',eventType:'Congress',sector:'Association',audience:'Professionals',marketPositioning:'National',industry:'Medical',registrations:1042,localRegistrations:160,interstateRegistrations:712,internationalRegistrations:170,venueSpend:190165.9545,cateringSpend:457198.0386,marketingSpend:7160.8218,sponsorshipRevenue:317636.3636,exhibitionRevenue:241818.1818 },
  { id:'event-3',label:'Event 3',eventType:'Congress',sector:'Association',audience:'Professionals',marketPositioning:'National',industry:'Transport',registrations:634,localRegistrations:69,interstateRegistrations:502,internationalRegistrations:63,venueSpend:70492.5636,cateringSpend:271783.4091,marketingSpend:15900,sponsorshipRevenue:null,exhibitionRevenue:93250 },
]

const prospects = [
  ['L1754','Convention Centre C',1996,6956762.75,23,2025,'None','Agrifood','USA','Health & MedTech','Incentive',15,'Medium','Low',1,'Medium'],
  ['L8678','University Hall A',917,5190914.16,76,2023,'Low','Engineering','GERMANY','AgriBio','Trade Show',7,'High','Medium',3,'High'],
  ['L4471','University Hall A',2102,10761204.8,40,2025,'Medium','Engineering','AUSTRALIA','Digital Economy','Symposium',6,'Low','Low',2,'Medium'],
  ['L9529','Conference Suite A',3402,11993228.01,73,2026,'None','Engineering','AUSTRALIA','Digital Economy','Association Congress',11,'Low','High',5,'Medium'],
  ['L3840','Auditorium A',5132,5344109.78,18,2024,'None','Medical','CANADA','Digital Economy','Trade Show',20,'High','Medium',4,'High'],
  ['L6453','Exhibition Centre A',2054,1417557,42,2026,'Low','Sustainability','USA','AgriBio','Symposium',4,'Medium','Medium',4,'High'],
  ['L9237','University Hall A',2506,2016005.89,61,2024,'High','Medical','CANADA','Digital Economy','Symposium',8,'Medium','High',2,'Medium'],
  ['L6439','City Club A',4079,999494.08,67,2023,'Medium','Agrifood','GERMANY','Clean Economy','Association Congress',32,'High','Medium',2,'Medium'],
  ['L2683','Auditorium A',5054,8764323.03,24,2025,'Low','Life Sciences','SINGAPORE','Advanced Manufacturing','Corporate Meeting',8,'Low','High',1,'Medium'],
  ['L1530','Auditorium A',4487,11805623.4,12,2024,'None','Sustainability','GERMANY','Advanced Manufacturing','Incentive',5,'High','Medium',1,'High'],
] as const

async function main() {
  for (const dataset of datasets) await prisma.intelligenceDataset.upsert({ where:{ id:dataset.id }, update:dataset, create:dataset })
  for (const [datasetId,bidStatus,eventCount,eventDays,internationalDelegates,domesticDelegates,totalDelegates,internationalDays,domesticDays,totalDays,internationalSpend,domesticSpend,totalSpend] of summaries) {
    await prisma.forwardCalendarSummary.upsert({ where:{ datasetId_bidStatus:{datasetId,bidStatus} }, update:{eventCount,eventDays,internationalDelegates,domesticDelegates,totalDelegates,internationalDays,domesticDays,totalDays,internationalSpend,domesticSpend,totalSpend}, create:{datasetId,bidStatus,eventCount,eventDays,internationalDelegates,domesticDelegates,totalDelegates,internationalDays,domesticDays,totalDays,internationalSpend,domesticSpend,totalSpend} })
  }
  for (const [datasetId,bidStatus,reason,share,weightedCount,responseBase] of reasons) await prisma.forwardCalendarReason.upsert({ where:{datasetId_bidStatus_reason:{datasetId,bidStatus,reason}}, update:{share,weightedCount,responseBase}, create:{datasetId,bidStatus,reason,share,weightedCount,responseBase} })
  for (const [id,totalRevenue,conferenceSpend,operationsSpend,marketingSpend,generalShowSpend,directExpenses,grossProfit] of shows) await prisma.commercialEvent.upsert({ where:{id}, update:{datasetId:'commercial-eight-shows',label:id.replace('show-','Show ').toUpperCase(),totalRevenue,conferenceSpend,operationsSpend,marketingSpend,generalShowSpend,directExpenses,grossProfit}, create:{id,datasetId:'commercial-eight-shows',label:id.replace('show-','Show ').toUpperCase(),totalRevenue,conferenceSpend,operationsSpend,marketingSpend,generalShowSpend,directExpenses,grossProfit} })
  for (const event of detailedEvents) await prisma.commercialEvent.upsert({ where:{id:event.id}, update:{datasetId:'commercial-three-events',...event}, create:{datasetId:'commercial-three-events',...event} })
  for (const [leadId,venue,delegates,economicValue,existingWinPct,eventYear,fundOffer,economicSector,country,prioritySector,eventType,leadTimeMonths,localHostStrength,bidResources,competitorCount,strategicValue] of prospects) await prisma.bidRecord.upsert({ where:{datasetId_leadId:{datasetId:'bid-dummy-pilot',leadId}}, update:{status:'PROSPECT',venue,delegates,economicValue,existingWinPct,eventYear,fundOffer,economicSector,country,prioritySector,eventType,leadTimeMonths,localHostStrength,bidResources,competitorCount,strategicValue}, create:{id:`bid-${leadId.toLowerCase()}`,datasetId:'bid-dummy-pilot',leadId,status:'PROSPECT',venue,delegates,economicValue,existingWinPct,eventYear,fundOffer,economicSector,country,prioritySector,eventType,leadTimeMonths,localHostStrength,bidResources,competitorCount,strategicValue} })
  console.log('Intelligence scenarios seeded.')
}

main().finally(() => prisma.$disconnect())
