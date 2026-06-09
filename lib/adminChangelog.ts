export type AdminChangelogEntry = {
  version: string
  date: string
  title: string
  intent: string
  areas: string[]
  changes: string[]
  proof: string[]
}

export const ADMIN_CHANGELOG: AdminChangelogEntry[] = [
  {
    version: 'v1.3',
    date: '9 June 2026',
    title: 'Launch security and account governance',
    intent: 'Move from shared credentials toward controlled user lifecycle, password rotation, and auditable sensitive access.',
    areas: ['Account security', 'Admin invites', 'CSRF protection', 'Audit logging', 'Power BI/export governance'],
    changes: [
      'Added a forced password-change flow for temporary credentials.',
      'Added admin-side account invite/provisioning with one-time temporary passwords and first-login rotation.',
      'Added stronger password policy enforcement for registrations and password changes.',
      'Added same-origin protection for unsafe API methods to reduce CSRF risk.',
      'Added persistent security audit logging for logins, failed logins, password changes, user invites, exports, and Power BI feed access.',
      'Added an admin Security Events page for recent sensitive access and reporting events.',
    ],
    proof: [
      'Local Prisma client generation passed.',
      'Local lint and production build passed.',
      'Production schema push, build, restart, and smoke checks completed.',
    ],
  },
  {
    version: 'v1.2',
    date: '9 June 2026',
    title: 'Security review remediation',
    intent: 'Apply priority fixes from the SecSpy review before wider stakeholder access.',
    areas: ['Auth', 'Demo access', 'Power BI feed', 'Documentation'],
    changes: [
      'Removed production rendering of fixed demo credentials from the login page unless explicitly enabled for a non-production walkthrough.',
      'Changed seed behaviour so fixed demo users are not created in production unless explicitly allowed or replaced by environment-specific credentials.',
      'Revalidated JWT sessions against current user approval status and role data, so rejected or changed accounts lose access on their next request.',
      'Limited bearer-token Power BI access to privacy-suppressed aggregate rows; raw organisation-level feeds now require an admin session.',
      'Removed public demo credentials from the README and documented the safer local-only demo-account controls.',
    ],
    proof: [
      'SecSpy prioritized live demo admin access and raw Power BI feed exposure.',
      'Local lint and production build passed after remediation.',
      'Production demo credentials were invalidated after deployment.',
    ],
  },
  {
    version: 'v1.1',
    date: '9 June 2026',
    title: 'Security review hotfixes',
    intent: 'Close concrete access-control and data-exposure issues found during a safe penetration-test pass.',
    areas: ['Auth', 'Member APIs', 'Admin APIs', 'Security headers'],
    changes: [
      'Restricted member metric and benchmark APIs so member users cannot request other pillar metadata via query string.',
      'Removed password hashes from the admin members API response.',
      'Added baseline security headers for content sniffing, clickjacking, referrer policy, browser permissions, and HSTS.',
      'Added in-process login throttling to slow repeated credential attempts.',
    ],
    proof: [
      'Local lint passed.',
      'Local production build passed.',
    ],
  },
  {
    version: 'v1.0',
    date: '9 June 2026',
    title: 'Brand-awareness pass',
    intent: 'Make the admin, methodology, reporting, and review surfaces easier to keep aligned to the ABEA identity.',
    areas: ['Brand guide', 'Methodology', 'Review pack', 'Admin navigation'],
    changes: [
      'Added formal brand identity labels and colour-usage guidance.',
      'Added admin Brand Guide with logo, naming, tagline, colour system, pillar colours, and report tone rules.',
      'Linked Brand Guide from the stakeholder Review Pack and admin navigation.',
      'Updated methodology input-category accents to use ABEA brand colours instead of off-brand purple/red values.',
    ],
    proof: [
      'Local lint passed.',
      'Local production build passed.',
    ],
  },
  {
    version: 'v0.9',
    date: '9 June 2026',
    title: 'Exportable stakeholder artefacts and privacy controls',
    intent: 'Give reviewers shareable report artefacts while making privacy suppression explicit across aggregate reporting surfaces.',
    areas: ['Report packs', 'Review pack', 'Power BI', 'Privacy threshold', 'Exports'],
    changes: [
      'Added report-pack generator for board, government, and internal review audiences.',
      'Report packs include executive summary, methodology basis, data quality/import notes, aggregate metric summary, and open decisions appendix.',
      'Added print-friendly stakeholder review pack view for meeting distribution or save-as-PDF.',
      'Added configurable reporting minimum sample size and suppression helper.',
      'Applied suppression metadata to aggregate CSV exports and Power BI aggregate feeds.',
      'Added Power BI feed status indicators for bearer-token configuration and aggregate privacy threshold.',
    ],
    proof: [
      'Local lint passed.',
      'Local production build passed.',
    ],
  },
  {
    version: 'v0.8',
    date: '9 June 2026',
    title: 'Stakeholder review packaging',
    intent: 'Turn the build into a coherent review experience for ABEA, vendor, government, member, and Power BI/data analyst audiences.',
    areas: ['Review pack', 'Open decisions', 'Walkthroughs', 'Admin navigation'],
    changes: [
      'Added stakeholder review pack hub linking methodology, changelog, security audit, report builder, government view, Power BI guide, data quality, decisions, and walkthroughs.',
      'Added open decisions register covering multipliers, jurisdiction/program wording, privacy thresholds, import rollback policy, Power BI integration mode, and required core metrics.',
      'Added guided walkthrough scripts for ABEA admin, member organisation, government viewer, and Power BI/data analyst review paths.',
      'Added demo-account references and suggested review order for stakeholder sessions.',
    ],
    proof: [
      'Local lint passed.',
      'Local production build passed.',
    ],
  },
  {
    version: 'v0.7',
    date: '9 June 2026',
    title: 'External-review readiness',
    intent: 'Make the platform easier to demonstrate and safer to show to external reviewers before real onboarding.',
    areas: ['Demo data', 'Security audit', 'Admin changelog', 'Benchmarks', 'Reports'],
    changes: [
      'Added deterministic demo scenario seeding across multiple periods, pillars, regions, tiers, cohorts, event types, capacity bands, and government programs.',
      'Demo scenario seed creates import batches and processed submissions so import governance, report builder, government reporting, and Power BI feeds have richer walkthrough data.',
      'Demo scenario seed recalculates benchmarks across the demo reporting periods.',
      'Added admin security access audit page covering role boundaries, admin APIs, government views, member reports, rejected data, excluded imports, exports, and Power BI feed access.',
      'Added QA checklist coverage for demo scenario data and security audit review.',
    ],
    proof: [
      'Local lint passed.',
      'Local production build passed.',
      'Demo seed script added as npm run demo:seed.',
    ],
  },
  {
    version: 'v0.6',
    date: '9 June 2026',
    title: 'Dimension governance, import controls, and Power BI feed',
    intent: 'Turn the reporting lake into something operations teams can govern before real vendor files and external BI users arrive.',
    areas: ['Admin organisations', 'Admin imports', 'Power BI', 'Report builder', 'Government reporting', 'Benchmarks'],
    changes: [
      'Added controlled reporting-dimension fields for region, tier, reporting cohort, primary event type, capacity band, and government program.',
      'Added admin dropdown controls so dimensions are managed through controlled lists instead of drifting free text.',
      'Added import-batch review screen with file status, row counts, accepted/rejected rows, linked submissions, and validation summaries.',
      'Added import-batch include/exclude controls so bad vendor files can be removed from official reporting without deleting audit history.',
      'Updated report builder, government reporting, benchmark recalculation, aggregate exports, and Power BI feeds to exclude batches marked out of reporting.',
      'Added Power BI feed endpoints for metric values, aggregates, submissions, organisations, and import batches.',
      'Added admin Power BI guide with the recommended fact/dimension model and bearer-token path for scheduled refresh.',
    ],
    proof: [
      'Local lint passed.',
      'Local production build passed.',
      'Commit c6422f1 deployed to production.',
      'Production smoke checks passed for /admin/imports, /admin/powerbi, /admin/organisations, and Power BI feed tables.',
    ],
  },
  {
    version: 'v0.5',
    date: '9 June 2026',
    title: 'Report builder and government analytics',
    intent: 'Move from dashboard snapshots to repeatable, filtered reporting outputs suitable for ABEA, board, and government audiences.',
    areas: ['Admin reports', 'Government reporting', 'Exports', 'Reporting model'],
    changes: [
      'Added admin report builder with filters for period, pillar, region, tier, and metric code.',
      'Added aggregate report rows with sample size, average, total, min, max, regions, and tiers.',
      'Added aggregate CSV export for report-builder outputs.',
      'Upgraded government reporting with period selector, methodology/version metadata, benchmark vintage, sample context, processed row counts, period trend table, and economic impact input table.',
      'Added first reporting-dimension fields to support cohort, event type, capacity band, and government program linkage.',
      'Added CSV import-batch model and linked successful CSV uploads to their source batch.',
    ],
    proof: [
      'Local lint passed.',
      'Local production build passed.',
      'Commit d8f40e7 deployed to production.',
      'Production smoke checks passed for /admin/reports, /govt, aggregate CSV export, and government overview API.',
    ],
  },
  {
    version: 'v0.4',
    date: '9 June 2026',
    title: 'Data-lake reporting controls',
    intent: 'Make submission governance, data-quality monitoring, and lake-ready exports explicit before the dataset grows.',
    areas: ['Admin submissions', 'Data quality', 'Audit trail', 'Exports', 'Member PDF reports'],
    changes: [
      'Added submission audit-event model for submitted, CSV uploaded, processed, and rejected lifecycle events.',
      'Added admin submission timeline showing recent audit events per record.',
      'Changed admin rejection to a clearer REJECTED status with required rejection notes.',
      'Added data-quality dashboard with lake fact-row count, audit-event count, reporting periods, incomplete records, stale contributors, and rejected/error records.',
      'Added reviewed-submissions CSV export in long format for lake ingestion and governance review.',
      'Updated member PDF reports with methodology version, benchmark vintage, submission review date, sample context, and processed-record caveat.',
    ],
    proof: [
      'Local lint passed.',
      'Local production build passed.',
      'Commit 056f0ec deployed to production.',
      'Production smoke checks passed for /admin/data-quality and reviewed CSV export.',
    ],
  },
  {
    version: 'v0.3',
    date: '9 June 2026',
    title: 'Submission review workflow and methodology versioning',
    intent: 'Give ABEA manual governance over incoming member data and make benchmark recalculation defensible.',
    areas: ['Admin submissions', 'Benchmarks', 'Methodology', 'Member guidance'],
    changes: [
      'Added admin process action for submitted records.',
      'Added admin reject action with required rejection note.',
      'Stored review metadata including reviewed time, reviewer ID, and review note.',
      'Stopped benchmark recalculation from automatically processing submitted records.',
      'Kept benchmark recalculation limited to admin-processed submissions.',
      'Added visible methodology version/date across methodology and report-facing content.',
      'Expanded member metric guidance for clearer data entry.',
    ],
    proof: [
      'Local lint and build passed during the governance deployment slice.',
      'Production smoke checks passed after deployment.',
    ],
  },
  {
    version: 'v0.2',
    date: '9 June 2026',
    title: 'Methodology, validation, and stakeholder review pack',
    intent: 'Make the prototype easier for ABEA, vendor, and government stakeholders to inspect and trust.',
    areas: ['Public methodology', 'Validation', 'Reports', 'Documentation'],
    changes: [
      'Added public methodology page covering collection, validation, aggregation, reporting process, economic-impact inputs, and stakeholder review points.',
      'Linked methodology from public navigation and footer.',
      'Expanded input-category model for methodology principles, process steps, and review questions.',
      'Hardened manual and CSV submission validation for active metric codes, numeric values, percent bounds, duplicate metrics, period mismatches, and empty payloads.',
      'Expanded stakeholder review pack and QA checklist.',
      'Added methodology section to member PDF reporting.',
    ],
    proof: [
      'Local lint and build passed during the methodology deployment slice.',
      'Production smoke checks passed after deployment.',
    ],
  },
]
