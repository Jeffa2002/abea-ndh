# ABEA National Data Hub Stakeholder Review Pack

Generated: 2026-06-09
Methodology version: v0.2

## Purpose

This pack summarises the current review slice for ABEA, vendor, and government stakeholders. The site now reflects the ABEA brand guide, the updated vendor economic-impact input model, and clearer data protection and methodology language.

## What Changed

- Public site now uses the ABEA visual system, including Royalist Blue, Sunday Yellow, Hibiscus Red, Marine/Splashed/Sky blues, Light Grey, and Noto Sans fallback styling.
- Home, About, and Methodology pages explain the National Data Hub purpose, data protections, four industry pillars, and benchmark workflow.
- Organiser metrics now separate delegate/exhibitor inputs from organiser-side direct spend.
- Delegate/exhibitor input language now covers direct event spend, indirect visitor spend, event and shoulder days, accompanying guests, exhibiting cost, and national/international segmentation.
- Organiser input language now covers direct spend into Victoria, including sponsorship and delegate entertaining.
- Methodology caveat is visible across the site and reports: subject to final government input, a multiplier may be applied to selected spend categories.
- CSV upload validation now checks active metric codes, numeric values, negative values, percentage bounds, duplicate metrics, and reporting-period mismatches before saving.
- Member PDF reports now include a methodology page before metric detail pages.
- Member PDF reports now include data-basis metadata: methodology version, benchmark vintage, submission review date, sample context, and processed-record caveat.
- Admins can explicitly process or reject submissions before those submissions are eligible for benchmark recalculation.
- Submission review now writes audit events, giving ABEA an event trail for ingestion, CSV upload, processing, and rejection decisions.
- Admin data-quality view added for the reporting-lake path: long-format fact-row count, audit event count, reporting-period coverage, incomplete core metric sets, stale contributors, rejected records, and lake-ready CSV export.
- Admin report builder added at `/admin/reports` for governed aggregate extracts filtered by period, pillar, region, tier, and metric code.
- Aggregate report CSV export added at `/api/admin/reports/export`.
- Government reporting now shows period selector, reporting basis metadata, benchmark vintage, sample context, processed-row counts, trend table, and economic impact/spend inputs.
- Data model now includes first-class reporting dimensions for organisation cohort, primary event type, capacity band, government program, and CSV import batches.
- CSV import batches now record filename, status, period, pillar, row counts, accepted/rejected counts, uploader, and validation summary.
- Organisation admin now manages controlled reporting dimensions through dropdowns, reducing free-text drift in future reporting.
- Import governance now has `/admin/imports` for batch review and reporting inclusion/exclusion without deleting audit history.
- Report builder, government reporting, benchmark recalculation, and Power BI feeds exclude batches marked as excluded from reporting.
- Power BI feed added at `/api/powerbi/lake`, with table selectors for metric values, aggregates, submissions, organisations, and import batches.
- Power BI admin guide added at `/admin/powerbi`, including suggested fact/dimension modelling and bearer-token deployment note.
- Demo scenario seed added for multi-period, multi-pillar, multi-dimension walkthrough data with linked import batches and recalculated benchmarks.
- Security access audit added at `/admin/security-audit` to document role boundaries, export/feed controls, rejected data handling, and import exclusion behaviour.
- Stakeholder review hub added at `/admin/review-pack` to link methodology, changelog, reports, government view, Power BI, data quality, decisions, and walkthroughs.
- Open decisions register added at `/admin/decisions`.
- Guided review scripts added at `/admin/walkthroughs` for ABEA admin, member, government viewer, and Power BI/data analyst audiences.
- Benchmark recalculation now uses a selected period and minimum sample threshold.

## Review Questions

- Does the delegate/exhibitor category language match the vendor's intended model?
- Which spend categories should receive any final government multiplier?
- Should "Organiser Direct Spend into Victoria" remain the default label for all markets, or should it be configurable by jurisdiction?
- Do event days, shoulder days, accompanying guests, and exhibiting costs need examples in the submission form?
- Are national and international participant share labels clear enough for member organisations?
- Should submitted data move automatically from `SUBMITTED` to `PROCESSED`, or should ABEA retain a manual review step?

## Suggested Walkthrough

1. Visit `/`, `/about`, and `/methodology` without signing in.
2. Register a member account and confirm the language on the pending approval flow.
3. Sign in with an approved organiser member and open `/dashboard/submit`.
4. Submit organiser metrics manually, including national and international participant share.
5. Try a CSV upload with one invalid metric code and confirm the row-level validation message.
6. Open `/dashboard/benchmarks` and download the PDF report.
7. Sign in as an admin and review `/admin/submissions`, `/admin/benchmarks`, `/admin/members`, and `/admin/organisations`.
8. Open `/admin/data-quality` and review import governance, completeness, stale contributors, and reviewed-submissions CSV export.
9. Open `/admin/imports`, review batches, and test excluding/including a batch where test data allows it.
10. Open `/admin/organisations` and update reporting dimensions through the controlled lists.
11. Open `/admin/reports`, filter the aggregate extract, and download the aggregate CSV.
12. Open `/admin/powerbi` and inspect the available Power BI feed tables.
13. Open `/admin/security-audit` and review access-control expectations.
14. Open `/admin/review-pack`, `/admin/decisions`, and `/admin/walkthroughs`.
15. Sign in as a government viewer and review `/govt`, including report basis, trends, and economic input tables.

## Open Decisions

- Final multiplier rules and which categories they apply to.
- Whether government reporting should be Victoria-specific or support state/territory variants.
- Whether organiser submissions should ask for examples or guidance text beside each metric.
- Whether ABEA wants a visible methodology version number for external reporting.
- Which reporting-dimension values ABEA wants as controlled lists: jurisdiction/state, event type, organisation cohort, venue capacity band, and government-program linkage.
- Whether import rollback should delete created submissions or mark batches as excluded from official reporting.
- Whether ABEA wants Power BI scheduled refresh via secured Web connector first, or direct push semantic models through the Power BI REST API once Microsoft tenant/app credentials are available.
