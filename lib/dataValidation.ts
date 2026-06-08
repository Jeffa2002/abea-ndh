export type MetricForValidation = {
  code: string
  label: string
  unit: string
}

export type MetricInput = {
  code: string
  value: unknown
  row?: number
  period?: string
}

export type ValidationIssue = {
  row?: number
  metricCode?: string
  field: string
  message: string
}

export type ValidatedMetricValue = {
  code: string
  value: number
}

const PERIOD_PATTERN = /^\d{4}-(FY|H[12]|Q[1-4])$/

export function validatePeriod(period: unknown): ValidationIssue[] {
  if (typeof period !== 'string' || period.trim() === '') {
    return [{ field: 'period', message: 'Reporting period is required.' }]
  }
  if (!PERIOD_PATTERN.test(period.trim())) {
    return [{ field: 'period', message: 'Use a period like 2025-FY, 2025-H1, or 2025-Q1.' }]
  }
  return []
}

export function validateMetricInputs(
  inputs: MetricInput[],
  allowedMetrics: MetricForValidation[],
  period: string,
): { values: ValidatedMetricValue[]; issues: ValidationIssue[] } {
  const metricByCode = new Map(allowedMetrics.map(metric => [metric.code, metric]))
  const issues: ValidationIssue[] = []
  const values: ValidatedMetricValue[] = []
  const seen = new Set<string>()

  for (const input of inputs) {
    const code = typeof input.code === 'string' ? input.code.trim() : ''
    const row = input.row

    if (!code) {
      issues.push({ row, field: 'metric_code', message: 'Metric code is required.' })
      continue
    }

    const metric = metricByCode.get(code)
    if (!metric) {
      issues.push({
        row,
        metricCode: code,
        field: 'metric_code',
        message: 'Metric code is not active for your organisation pillar.',
      })
      continue
    }

    if (seen.has(code)) {
      issues.push({
        row,
        metricCode: code,
        field: 'metric_code',
        message: 'Metric code is duplicated in this submission.',
      })
      continue
    }
    seen.add(code)

    if (input.period && input.period.trim() && input.period.trim() !== period) {
      issues.push({
        row,
        metricCode: code,
        field: 'period',
        message: `Row period ${input.period.trim()} does not match selected period ${period}.`,
      })
    }

    const value = typeof input.value === 'number'
      ? input.value
      : Number(String(input.value ?? '').replace(/[$,]/g, '').trim())

    if (!Number.isFinite(value)) {
      issues.push({
        row,
        metricCode: code,
        field: 'value',
        message: `${metric.label} needs a numeric value.`,
      })
      continue
    }

    if (value < 0) {
      issues.push({
        row,
        metricCode: code,
        field: 'value',
        message: `${metric.label} cannot be negative.`,
      })
      continue
    }

    if (metric.unit === 'percent' && value > 100) {
      issues.push({
        row,
        metricCode: code,
        field: 'value',
        message: `${metric.label} must be between 0 and 100 percent.`,
      })
      continue
    }

    values.push({ code, value })
  }

  if (values.length === 0 && issues.length === 0) {
    issues.push({ field: 'metrics', message: 'Submit at least one metric value.' })
  }

  return { values, issues }
}

export function validationSummary(issues: ValidationIssue[]): string {
  if (issues.length === 0) return ''
  const first = issues[0]
  const location = first.row ? `Row ${first.row}: ` : ''
  const suffix = issues.length > 1 ? ` ${issues.length - 1} more issue${issues.length === 2 ? '' : 's'} found.` : ''
  return `${location}${first.message}${suffix}`
}
