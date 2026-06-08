export type OpenDecision = {
  id: string
  title: string
  owner: 'ABEA' | 'Vendor' | 'Government' | 'Joint'
  priority: 'High' | 'Medium' | 'Low'
  status: 'Open' | 'Draft recommendation' | 'Ready for review'
  context: string
  recommendation: string
}

export const OPEN_DECISIONS: OpenDecision[] = [
  {
    id: 'D-001',
    title: 'Economic-impact multiplier rules',
    owner: 'Government',
    priority: 'High',
    status: 'Open',
    context: 'The methodology notes that a multiplier may be applied to selected spend categories subject to final government input.',
    recommendation: 'Confirm which spend categories receive multipliers, the approved multiplier source, and whether rules vary by jurisdiction.',
  },
  {
    id: 'D-002',
    title: 'Jurisdiction wording and program linkage',
    owner: 'Joint',
    priority: 'High',
    status: 'Draft recommendation',
    context: 'The platform now stores region, cohort, event type, capacity band, and government program dimensions.',
    recommendation: 'Adopt controlled lists before onboarding real members, then review whether state-specific labels are needed for organiser direct spend.',
  },
  {
    id: 'D-003',
    title: 'Privacy threshold for public/government benchmarks',
    owner: 'ABEA',
    priority: 'High',
    status: 'Ready for review',
    context: 'Benchmark recalculation already supports a minimum sample size, currently defaulting to n=5 in the admin UI.',
    recommendation: 'Confirm the minimum sample threshold for each audience and whether small-cell suppression should apply to exports and Power BI feeds.',
  },
  {
    id: 'D-004',
    title: 'CSV import rollback policy',
    owner: 'ABEA',
    priority: 'Medium',
    status: 'Draft recommendation',
    context: 'Import batches can be excluded from reporting without deleting submissions or audit history.',
    recommendation: 'Use exclusion as the default reversible control; only hard-delete imported rows under a documented admin maintenance procedure.',
  },
  {
    id: 'D-005',
    title: 'Power BI integration mode',
    owner: 'Joint',
    priority: 'Medium',
    status: 'Open',
    context: 'The app now exposes Power BI-friendly JSON feed tables and can later support direct push integration if Microsoft tenant details are supplied.',
    recommendation: 'Start with secured pull-based scheduled refresh, then revisit direct semantic-model push once the workspace owner and app registration are known.',
  },
  {
    id: 'D-006',
    title: 'Required core metrics by pillar',
    owner: 'ABEA',
    priority: 'Medium',
    status: 'Ready for review',
    context: 'Core metric definitions now drive validation, completeness, benchmarks, and report coverage.',
    recommendation: 'Approve the current core metric set and mark any optional or legacy metrics before real onboarding.',
  },
]
