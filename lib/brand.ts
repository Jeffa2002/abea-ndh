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

export const PILLAR_COLORS: Record<Pillar, string> = {
  VENUE: BRAND_COLORS.marine,
  ORGANISER: BRAND_COLORS.sunday,
  SUPPLIER: BRAND_COLORS.hibiscus,
  BUREAU: BRAND_COLORS.splashed,
}

export function isPillar(value: string | null | undefined): value is Pillar {
  return value === 'VENUE' || value === 'ORGANISER' || value === 'SUPPLIER' || value === 'BUREAU'
}
