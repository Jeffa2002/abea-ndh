export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const text = value instanceof Date ? value.toISOString() : String(value)
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

export function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.map(csvEscape).join(',')
  const body = rows.map(row => columns.map(column => csvEscape(row[column])).join(','))
  return [header, ...body].join('\n')
}
