export type SecurityAuditItem = {
  area: string
  check: string
  expected: string
  risk: 'Low' | 'Medium' | 'High'
  status: 'Pass' | 'Monitor'
}

export const SECURITY_AUDIT_ITEMS: SecurityAuditItem[] = [
  {
    area: 'Admin pages',
    check: 'Only ADMIN users can access /admin and admin child pages.',
    expected: 'Unauthenticated users are redirected to login; member and government users are redirected away.',
    risk: 'High',
    status: 'Pass',
  },
  {
    area: 'Admin APIs',
    check: 'Only ADMIN users can access /api/admin routes and exports.',
    expected: 'Admin APIs return 401/redirect without valid admin credentials.',
    risk: 'High',
    status: 'Pass',
  },
  {
    area: 'Government reporting',
    check: 'Only ADMIN and GOVT_VIEWER users can access /govt and /api/govt/overview.',
    expected: 'Members cannot access government reporting surfaces.',
    risk: 'High',
    status: 'Pass',
  },
  {
    area: 'Member reporting',
    check: 'Members only receive report data for their own organisation through session orgId.',
    expected: 'Member report APIs derive organisation from the signed session rather than request parameters.',
    risk: 'High',
    status: 'Pass',
  },
  {
    area: 'Rejected data',
    check: 'Rejected submissions are retained for governance but excluded from reporting outputs.',
    expected: 'Report builder, government reporting, benchmarks, and Power BI feeds use processed submissions only.',
    risk: 'Medium',
    status: 'Pass',
  },
  {
    area: 'Excluded imports',
    check: 'Import batches excluded by admins do not feed official reporting.',
    expected: 'Report builder, government reporting, benchmarks, and Power BI feeds filter excluded batches.',
    risk: 'Medium',
    status: 'Pass',
  },
  {
    area: 'Power BI feed',
    check: 'Power BI lake feed requires an admin session or configured bearer token.',
    expected: 'Unauthenticated callers receive 401 unless POWERBI_FEED_TOKEN is configured and supplied.',
    risk: 'High',
    status: 'Pass',
  },
  {
    area: 'Exports',
    check: 'CSV exports sit behind admin-only API routes or admin-authenticated Power BI feed routes.',
    expected: 'Reviewed submissions and aggregate exports are not public endpoints.',
    risk: 'High',
    status: 'Pass',
  },
]
