import { WALKTHROUGHS } from '@/lib/walkthroughs'

export const dynamic = 'force-dynamic'

export default function WalkthroughsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Demo Walkthroughs</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          Guided scripts for stakeholder review sessions. Use these to show the platform by audience rather than clicking through features randomly.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {WALKTHROUGHS.map(walkthrough => (
          <div key={walkthrough.audience} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{walkthrough.audience}</div>
            <div className="mt-2 text-lg font-black" style={{ color: '#052460' }}>{walkthrough.steps.length} steps</div>
            <div className="mt-2 text-xs leading-5 text-gray-500">{walkthrough.goal}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {WALKTHROUGHS.map(walkthrough => (
          <section key={walkthrough.audience} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b bg-gray-50 px-6 py-5">
              <div className="text-xs font-bold uppercase text-gray-400">{walkthrough.account}</div>
              <h2 className="mt-2 text-xl font-black" style={{ color: '#052460' }}>{walkthrough.audience}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{walkthrough.goal}</p>
            </div>
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_320px]">
              <div className="p-6">
                <h3 className="mb-3 text-sm font-bold uppercase text-gray-400">Walkthrough Steps</h3>
                <ol className="space-y-3">
                  {walkthrough.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6 text-gray-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--abea-sunday)] text-xs font-bold text-white">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <aside className="border-t bg-gray-50 p-6 md:border-l md:border-t-0">
                <h3 className="mb-3 text-sm font-bold uppercase text-gray-400">Proof Points</h3>
                <ul className="space-y-3">
                  {walkthrough.proofPoints.map(point => (
                    <li key={point} className="text-xs leading-5 text-gray-600">{point}</li>
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
