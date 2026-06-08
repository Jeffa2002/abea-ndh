export const REPORTING_MIN_SAMPLE_SIZE = Number(process.env.REPORTING_MIN_SAMPLE_SIZE || 3)

export function isSuppressed(sampleSize: number) {
  return sampleSize < REPORTING_MIN_SAMPLE_SIZE
}

export function displaySampleValue(value: string, sampleSize: number) {
  return isSuppressed(sampleSize) ? 'Suppressed' : value
}
