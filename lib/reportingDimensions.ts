export const REPORTING_DIMENSIONS = {
  regions: ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA', 'National'],
  tiers: ['Small', 'SME', 'Mid', 'Large', 'Enterprise'],
  cohorts: ['Foundation member', 'Pilot participant', 'Government program', 'Regional contributor', 'Strategic partner'],
  eventTypes: ['Conference', 'Exhibition', 'Incentive', 'Corporate meeting', 'Association event', 'Festival/business event', 'Mixed portfolio'],
  capacityBands: ['Under 250', '250-999', '1,000-2,999', '3,000-7,499', '7,500+'],
  governmentPrograms: ['None', 'Federal program', 'State program', 'Regional tourism program', 'Trade and investment program'],
} as const

export function cleanDimension(value: unknown, allowed: readonly string[]): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return null
  return allowed.includes(trimmed) ? trimmed : undefined
}
