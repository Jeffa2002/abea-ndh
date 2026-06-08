import type { Pillar } from '@prisma/client'

export const BRAND_COLORS = {
  royalist: '#052460',
  sunday: '#F99F38',
  hibiscus: '#EF3D55',
  marine: '#1C4DA1',
  splashed: '#00A7E2',
  sky: '#A3C7E9',
  lightGrey: '#EFEEEE',
  black: '#000000',
  white: '#FFFFFF',
} as const

export const BRAND_IDENTITY = {
  organisationName: 'Australian Business Events Association',
  productName: 'National Data Hub',
  shortName: 'ABEA National Data Hub',
  adminName: 'Admin Control Panel',
  governmentName: 'Government View',
  tagline: 'A shared evidence base for Australia\'s business events industry.',
} as const

export const BRAND_COLOR_USAGE = [
  { name: 'Royalist Blue', token: 'royalist', hex: BRAND_COLORS.royalist, use: 'Primary navigation, headings, report covers, authoritative actions.' },
  { name: 'Sunday Yellow', token: 'sunday', hex: BRAND_COLORS.sunday, use: 'Primary accents, calls to action, active review states.' },
  { name: 'Hibiscus Red', token: 'hibiscus', hex: BRAND_COLORS.hibiscus, use: 'Rejection, risk, exceptions, data-quality warnings needing attention.' },
  { name: 'Marine Blue', token: 'marine', hex: BRAND_COLORS.marine, use: 'Venue pillar, secondary information, structured report panels.' },
  { name: 'Splashed Blue', token: 'splashed', hex: BRAND_COLORS.splashed, use: 'Bureau pillar, positive proof points, reportable data signals.' },
  { name: 'Sky Blue', token: 'sky', hex: BRAND_COLORS.sky, use: 'Soft explanatory backgrounds and methodology notes.' },
  { name: 'Light Grey', token: 'lightGrey', hex: BRAND_COLORS.lightGrey, use: 'Page background, table headers, low-emphasis bands.' },
] as const

export const PILLAR_COLORS: Record<Pillar, string> = {
  VENUE: BRAND_COLORS.marine,
  ORGANISER: BRAND_COLORS.sunday,
  SUPPLIER: BRAND_COLORS.hibiscus,
  BUREAU: BRAND_COLORS.splashed,
}

export function isPillar(value: string | null | undefined): value is Pillar {
  return value === 'VENUE' || value === 'ORGANISER' || value === 'SUPPLIER' || value === 'BUREAU'
}
