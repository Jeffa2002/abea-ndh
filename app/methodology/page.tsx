import Image from 'next/image'
import Link from 'next/link'
import {
  INPUT_CATEGORY_CAVEAT,
  METHODOLOGY_UPDATED_AT,
  METHODOLOGY_VERSION,
  METHODOLOGY_PRINCIPLES,
  METHODOLOGY_STEPS,
  STAKEHOLDER_REVIEW_POINTS,
  UPDATED_INPUT_CATEGORIES,
} from '@/lib/inputCategories'

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[var(--abea-light-grey)] text-[var(--abea-black)]">
      <nav className="sticky top-0 z-50 bg-[var(--abea-royalist)] px-6 py-4 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-4">
            <Image
              src="/brand/abea-logo-foot.png"
              alt="Australian Business Events Association"
              width={236}
              height={49}
              className="abea-logo h-11 w-auto max-w-[200px]"
              priority
            />
            <span className="hidden border-l border-white/20 pl-4 text-sm font-semibold text-white/70 sm:inline">
              National Data Hub
            </span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hidden text-white/70 transition-colors hover:text-white md:inline">
              Home
            </Link>
            <Link href="/about" className="hidden text-white/70 transition-colors hover:text-white md:inline">
              About
            </Link>
            <Link href="/login" className="text-white/80 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[var(--abea-sunday)] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      <section className="brand-hero px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[var(--abea-sky)]">
            Methodology {METHODOLOGY_VERSION} · Updated {METHODOLOGY_UPDATED_AT}
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
            How the Hub turns member inputs into usable industry evidence.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76">
            The National Data Hub collects standardised pillar metrics, validates submissions, protects organisation-level records, and publishes aggregated benchmark outputs.
          </p>
        </div>
      </section>

      <main className="px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <section>
            <div className="mb-8 max-w-3xl">
              <p className="text-sm font-bold uppercase text-[var(--abea-hibiscus)]">Core principles</p>
              <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">A shared basis for collection, aggregation, and reporting.</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              {METHODOLOGY_PRINCIPLES.map((principle) => (
                <div key={principle.title} className="rounded-lg border border-black/5 bg-white p-6 shadow-sm">
                  <div className="mb-5 h-1.5 w-12 rounded-full bg-[var(--abea-sunday)]" />
                  <h3 className="font-bold text-[var(--abea-royalist)]">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{principle.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-black/5 bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-bold uppercase text-[var(--abea-marine)]">Updated input model</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">Economic-impact inputs are split by who generated the spend.</h2>
            <p className="mt-4 max-w-3xl leading-8 text-gray-700">
              The latest vendor model separates delegate and exhibitor activity from organiser-side direct spend, while preserving national and international segmentation for future analysis.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {UPDATED_INPUT_CATEGORIES.map((category) => (
                <div key={category.title} className="rounded-lg border p-6" style={{ borderColor: `${category.accent}33`, backgroundColor: `${category.accent}12` }}>
                  <h3 className="text-lg font-bold text-[var(--abea-royalist)]">{category.title}</h3>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-gray-700">
                    {category.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: category.accent }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm italic text-gray-500">{INPUT_CATEGORY_CAVEAT}</p>
          </section>

          <section>
            <div className="mb-8 max-w-3xl">
              <p className="text-sm font-bold uppercase text-[var(--abea-hibiscus)]">Process</p>
              <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">From submission to benchmark.</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              {METHODOLOGY_STEPS.map((step) => (
                <div key={step.n} className="rounded-lg border border-black/5 bg-white p-6 shadow-sm">
                  <div className="mb-6 text-5xl font-black text-[var(--abea-sunday)]/30">{step.n}</div>
                  <h3 className="font-bold text-[var(--abea-royalist)]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-black/5 bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-bold uppercase text-[var(--abea-marine)]">Reporting lake foundation</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">Designed for longitudinal national reporting, not one-off spreadsheet snapshots.</h2>
            <p className="mt-4 max-w-3xl leading-8 text-gray-700">
              The Hub keeps submissions, metric values, reporting periods, methodology versions, benchmark sample sizes, and admin review events as separate governed records. This lets future reports cut the same evidence by period, state, pillar, cohort, contributor status, and benchmark vintage without changing the member submission model.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                ['Long-format metrics', 'Each metric value is stored with its submission, organisation, pillar, period, unit, and review status so analytics tools can aggregate at scale.'],
                ['Governed lifecycle', 'Submitted, processed, and rejected records keep audit events so ABEA can defend which data was included in a report.'],
                ['Report metadata', 'Member and stakeholder outputs carry methodology version, benchmark vintage, sample size, and reporting-period context.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-lg bg-[var(--abea-light-grey)] p-6">
                  <h3 className="font-bold text-[var(--abea-royalist)]">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[var(--abea-sky)] bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-bold uppercase text-[var(--abea-marine)]">Review points</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--abea-royalist)]">Questions for ABEA, the vendor, and government reviewers.</h2>
            <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {STAKEHOLDER_REVIEW_POINTS.map((point) => (
                <li key={point} className="rounded-lg bg-[var(--abea-light-grey)] p-5 text-sm leading-7 text-gray-700">
                  {point}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
