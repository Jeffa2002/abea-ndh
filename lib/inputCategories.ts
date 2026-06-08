export const UPDATED_INPUT_CATEGORIES = [
  {
    title: 'Delegates and exhibitors',
    accent: '#1C4DA1',
    items: [
      'Direct event spend',
      'Indirect spend - tourism, retail and local services',
      'Event days and shoulder days',
      'Accompanying guests',
      'Exhibiting cost for conference and expo formats',
      'National and international segmentation',
    ],
  },
  {
    title: 'Organisers',
    accent: '#F99F38',
    items: [
      'Direct spend into Victoria, including sponsorship and delegate entertaining',
      'National and international segmentation',
    ],
  },
] as const

export const INPUT_CATEGORY_CAVEAT =
  'Subject to final government input, a multiplier may be applied to selected spend categories.'

export const METHODOLOGY_VERSION = 'v0.2'
export const METHODOLOGY_UPDATED_AT = '9 June 2026'

export const METHODOLOGY_PRINCIPLES = [
  {
    title: 'Standardised definitions',
    desc: 'Each pillar submits against a common metric set so member data can be compared on the same basis.',
  },
  {
    title: 'Participant and organiser spend separated',
    desc: 'Delegate and exhibitor activity is captured separately from organiser-side spend into Victoria.',
  },
  {
    title: 'Segmentation preserved',
    desc: 'National and international participant shares are collected so advocacy can distinguish domestic and overseas contribution.',
  },
  {
    title: 'Aggregated before use',
    desc: 'Benchmarks are published only as aggregated outputs, with minimum contributor thresholds to reduce re-identification risk.',
  },
] as const

export const METHODOLOGY_STEPS = [
  {
    n: '01',
    title: 'Collect',
    desc: 'Members submit core metrics manually or through the CSV template for a defined reporting period.',
  },
  {
    n: '02',
    title: 'Validate',
    desc: 'The Hub checks metric codes, numeric values, reporting period consistency, and pillar alignment before storing submissions.',
  },
  {
    n: '03',
    title: 'Aggregate',
    desc: 'Accepted records are mapped to pillar metrics and rolled into benchmark snapshots once contribution thresholds are met.',
  },
  {
    n: '04',
    title: 'Report',
    desc: 'Members, administrators, and approved government viewers see benchmark outputs suited to their role.',
  },
] as const

export const STAKEHOLDER_REVIEW_POINTS = [
  'Confirm the delegate/exhibitor and organiser input category language matches the vendor model.',
  'Confirm which spend categories should receive any final government multiplier.',
  'Check that national and international segmentation labels are clear for members.',
  'Review whether event days, shoulder days, and accompanying guests need additional examples.',
  'Confirm whether Victoria-specific organiser spend should remain the default wording for all future reporting.',
] as const

export const ORGANISER_METRIC_GUIDANCE: Record<string, string> = {
  ORG_EVENTS_DELIVERED: 'Count events delivered in the reporting period, not events contracted for a later period.',
  ORG_TOTAL_DELEGATES: 'Include delegates and exhibitors across the submitted events. Avoid double counting repeat attendance across the same event.',
  ORG_DELEGATE_DIRECT_EVENT_SPEND: 'Use direct event spend attributed to delegates and exhibitors, before any final government multiplier is applied.',
  ORG_INDIRECT_VISITOR_SPEND: 'Capture linked visitor spend such as tourism, retail, hospitality, transport, and local services.',
  ORG_EVENT_AND_SHOULDER_DAYS: 'Include official event days plus recognised pre/post-event shoulder days used for visitor impact modelling.',
  ORG_ACCOMPANYING_GUESTS: 'Count guests accompanying delegates or exhibitors where those guests are part of the event impact estimate.',
  ORG_EXHIBITING_COST: 'Use exhibitor cost for conference and expo formats, including booth or exhibition participation costs where available.',
  ORG_NATIONAL_PARTICIPANT_PCT: 'Enter the Australian participant share as a percentage from 0 to 100.',
  ORG_INTERNATIONAL_PARTICIPANT_PCT: 'Enter the overseas participant share as a percentage from 0 to 100. National and international shares should usually total 100.',
  ORG_DIRECT_VIC_SPEND: 'Use organiser direct spend into Victoria, including sponsorship, delegate entertaining, and event delivery spend.',
}
