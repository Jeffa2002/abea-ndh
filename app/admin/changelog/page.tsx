import { ADMIN_CHANGELOG } from '@/lib/adminChangelog'

export const dynamic = 'force-dynamic'

export default function AdminChangelogPage() {
  const latest = ADMIN_CHANGELOG[0]
  const totalChanges = ADMIN_CHANGELOG.reduce((sum, entry) => sum + entry.changes.length, 0)
  const areaCount = new Set(ADMIN_CHANGELOG.flatMap(entry => entry.areas)).size

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Implementation Changelog</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          Product interpretation log for the ABEA National Data Hub: what changed, why it matters, which admin/reporting areas were affected, and what proof was run.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Latest version', value: latest.version, note: latest.title },
          { label: 'Release slices', value: ADMIN_CHANGELOG.length, note: 'Grouped by product intent' },
          { label: 'Changes recorded', value: totalChanges, note: 'Admin-visible interpretation items' },
          { label: 'Areas touched', value: areaCount, note: 'Public, admin, reports, data, BI' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{item.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: '#052460' }}>{item.value}</div>
            <div className="mt-2 text-xs leading-5 text-gray-500">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {ADMIN_CHANGELOG.map(entry => (
          <section key={entry.version} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b bg-gray-50 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase text-gray-400">{entry.version} · {entry.date}</div>
                  <h2 className="mt-2 text-xl font-black" style={{ color: '#052460' }}>{entry.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{entry.intent}</p>
                </div>
                <div className="flex max-w-lg flex-wrap gap-2">
                  {entry.areas.map(area => (
                    <span key={area} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500 shadow-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_320px]">
              <div className="p-6">
                <h3 className="mb-3 text-sm font-bold uppercase text-gray-400">Interpretation of Changes</h3>
                <ul className="space-y-3">
                  {entry.changes.map(change => (
                    <li key={change} className="flex gap-3 text-sm leading-6 text-gray-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--abea-sunday)]" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="border-t bg-gray-50 p-6 md:border-l md:border-t-0">
                <h3 className="mb-3 text-sm font-bold uppercase text-gray-400">Proof / Deploy Notes</h3>
                <ul className="space-y-3">
                  {entry.proof.map(item => (
                    <li key={item} className="text-xs leading-5 text-gray-600">{item}</li>
                  ))}
                </ul>
              </aside>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
