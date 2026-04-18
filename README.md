# ABEA National Business Events Data Hub

Prototype for the Australian Business Events Association National Data Hub.

## Overview

Aggregates standardised data across four industry pillars:
- **Venues** — Capacity, occupancy, revenue per delegate
- **Organisers** — Event delivery, delegate counts, budgets
- **Suppliers** — Contracts, retention, revenue growth
- **Bureaux** — Bids, win rates, economic impact

## Stack
- Next.js 15 App Router + TypeScript
- Prisma 6 + PostgreSQL
- JWT auth (custom, httpOnly cookies)
- Tailwind CSS v4

## Demo Accounts
- Admin: `admin@abea.org.au` / `Admin2026!`
- Govt: `viewer@austrade.gov.au` / `Govt2026!`
- Member (Venue): `member@sydney-icc.com.au` / `Member2026!`
- Member (Organiser): `member@events-australia.com.au` / `Member2026!`

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and configure
3. `npx prisma db push`
4. `npx prisma db seed`
5. `npm run dev`
