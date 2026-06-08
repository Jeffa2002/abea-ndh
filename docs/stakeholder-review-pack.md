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
- Admins can explicitly process or reject submissions before those submissions are eligible for benchmark recalculation.
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
8. Sign in as a government viewer and review `/govt`.

## Open Decisions

- Final multiplier rules and which categories they apply to.
- Whether government reporting should be Victoria-specific or support state/territory variants.
- Whether organiser submissions should ask for examples or guidance text beside each metric.
- Whether ABEA wants a visible methodology version number for external reporting.
