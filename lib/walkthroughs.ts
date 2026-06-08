export type Walkthrough = {
  audience: string
  goal: string
  account: string
  steps: string[]
  proofPoints: string[]
}

export const WALKTHROUGHS: Walkthrough[] = [
  {
    audience: 'ABEA admin',
    goal: 'Show how ABEA governs members, data quality, imports, reporting, Power BI, and decisions.',
    account: 'admin@abea.org.au',
    steps: [
      'Open Admin Overview and explain the lake fact-row, data-quality, report-builder, and government-reporting shortcuts.',
      'Open Organisations and show controlled reporting dimensions.',
      'Open Imports and explain included/excluded batch governance.',
      'Open Data Quality and review incomplete records, stale contributors, import batches, and lake-ready exports.',
      'Open Reports, filter to 2025-H1, and export aggregate CSV.',
      'Open Security Audit and explain role/export/feed controls.',
      'Open Changelog and Review Pack to show project interpretation and stakeholder-ready materials.',
    ],
    proofPoints: [
      'Admin can see governance and reporting controls in one workspace.',
      'Excluded imports stay auditable but do not feed official reporting.',
      'Reports are generated from processed, governed records only.',
    ],
  },
  {
    audience: 'Member organisation',
    goal: 'Show the member path from dashboard to submission history, benchmarks, and PDF report.',
    account: 'member@sydney-icc.com.au',
    steps: [
      'Open the member dashboard and show latest submission period, benchmark availability, and data-quality score.',
      'Open Submit Data and explain metric guidance and validation expectations.',
      'Open My Submissions and review submission status/history.',
      'Open Benchmarks and download the PDF report.',
      'Point out methodology version, benchmark vintage, and processed-record caveats in the report.',
    ],
    proofPoints: [
      'Members only see their own organisation data.',
      'Validation prevents bad metric codes, invalid percentages, negatives, duplicates, and period mismatches.',
      'Member reports carry methodology and data-basis metadata.',
    ],
  },
  {
    audience: 'Government viewer',
    goal: 'Show aggregate reporting, methodology basis, trends, and economic impact inputs without exposing individual organisations.',
    account: 'viewer@austrade.gov.au',
    steps: [
      'Open Government View and select 2025-H1.',
      'Review KPI cards for approved organisations, processed submissions, metric rows, sample context, and economic signal.',
      'Review methodology/version and benchmark-vintage notes.',
      'Review pillar charts, period trend, and economic impact input tables.',
      'Confirm that government users cannot access admin routes.',
    ],
    proofPoints: [
      'Government view is aggregate and anonymised.',
      'Methodology version and sample context are visible.',
      'Members and rejected/excluded rows do not leak into the view.',
    ],
  },
  {
    audience: 'Power BI or data analyst',
    goal: 'Show the lake-shaped feed tables and how they map to a Power BI model.',
    account: 'admin@abea.org.au',
    steps: [
      'Open Power BI admin page and review available feed tables.',
      'Inspect metric_values as the long-format fact table.',
      'Inspect aggregates for precomputed reporting rows.',
      'Inspect organisations and import_batches as dimension/governance tables.',
      'Explain bearer-token setup for scheduled refresh.',
    ],
    proofPoints: [
      'Power BI can consume stable table-shaped JSON feeds.',
      'Feeds exclude rejected submissions and excluded import batches.',
      'The model has fact, dimension, and governance tables.',
    ],
  },
]
