# ABEA National Business Events Data Hub

Prototype for the Australian Business Events Association National Data Hub.

## Overview

Aggregates standardised data across four industry pillars:
- **Venues** — Capacity, occupancy, revenue per delegate
- **Organisers** — Delegate and exhibitor spend, indirect visitor spend, event and shoulder days, accompanying guests, exhibiting costs, organiser direct spend into Victoria, and national/international segmentation
- **Suppliers** — Contracts, retention, revenue growth
- **Bureaux** — Bids, win rates, economic impact

## Stack
- Next.js 15 App Router + TypeScript
- Prisma 6 + PostgreSQL
- JWT auth (custom, httpOnly cookies)
- Tailwind CSS v4

## Demo Accounts

Demo accounts are disabled by default in production. For local-only walkthroughs, set
`ALLOW_DEMO_ACCOUNTS=true` before running the seed script, or provide private
`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_GOVT_EMAIL`, and
`SEED_GOVT_PASSWORD` values for an environment-specific review user.

## Review Materials

- Public methodology: `/methodology`
- Current methodology version: `v0.2` updated 9 June 2026
- Stakeholder review pack: `docs/stakeholder-review-pack.md`
- QA checklist: `docs/qa-checklist.md`

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and configure
3. `npx prisma db push`
4. `npx prisma db seed`
5. `npm run dev`
