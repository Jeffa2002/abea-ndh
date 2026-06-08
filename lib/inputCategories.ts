export const UPDATED_INPUT_CATEGORIES = [
  {
    title: 'Delegates and exhibitors',
    accent: '#8F80F4',
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
    accent: '#FF0000',
    items: [
      'Direct spend into Victoria, including sponsorship and delegate entertaining',
      'National and international segmentation',
    ],
  },
] as const

export const INPUT_CATEGORY_CAVEAT =
  'Subject to final government input, a multiplier may be applied to selected spend categories.'

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
