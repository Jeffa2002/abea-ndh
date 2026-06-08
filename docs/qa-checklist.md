# ABEA National Data Hub QA Checklist

## Public Pages

- `/` loads with ABEA brand styling and working navigation.
- `/about` explains purpose, pillars, data protection, and current input categories.
- `/methodology` explains principles, updated input categories, process, and review points.
- `/login` and `/register` render correctly on desktop and mobile widths.

## Member Flow

- Approved member can sign in.
- Dashboard shows organisation pillar, latest period, data quality, and benchmark availability.
- Manual submission rejects invalid values before saving:
  - Negative values
  - Percentages over 100
  - Unknown metric codes
  - Empty metric payloads
- CSV upload rejects invalid rows before saving:
  - Unknown metric code for the member pillar
  - Duplicate metric code
  - Non-numeric value
  - Negative value
  - Percentage over 100
  - Row period that does not match selected reporting period
- CSV upload ignores rows with blank values.
- Submission confirmation reports the saved metric count.
- Submission history expands to show saved metric values.
- Benchmarks page loads and PDF download succeeds.

## Admin Flow

- Admin overview loads.
- Organisations list loads.
- Members list loads and approval/rejection controls still work.
- Submissions list shows latest 100 submissions.
- Submitted records can be processed by an admin.
- Rejected records require a review note.
- Review date and review note display on the submissions table.
- Submission timeline displays audit events for submitted, CSV uploaded, processed, and rejected records.
- `/admin/data-quality` loads with lake fact rows, audit events, reporting periods, incomplete submissions, stale contributors, and rejected/error records.
- Reviewed-submissions CSV export downloads from `/api/admin/submissions/export`.
- Benchmarks page calculates without including legacy non-core organiser metrics.
- Benchmark recalculation uses only processed submissions.
- Benchmark recalculation respects selected period and minimum sample threshold.

## Government Flow

- Government viewer can access `/govt`.
- Government viewer cannot access admin-only pages.
- Industry overview charts load.
- Methodology note and privacy note are visible.

## Verification Commands

```bash
npm run lint
npm run build
```
