import { OPEN_DECISIONS } from '@/lib/openDecisions'

export const dynamic = 'force-dynamic'

export default function DecisionsPage() {
  const highPriority = OPEN_DECISIONS.filter(decision => decision.priority === 'High').length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Open Decisions</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          Decision register for ABEA, vendor, and government review. These items should be resolved or explicitly deferred before real data onboarding.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Decisions', value: OPEN_DECISIONS.length, note: 'Tracked review items' },
          { label: 'High priority', value: highPriority, note: 'Resolve before pilot launch' },
          { label: 'Owners', value: new Set(OPEN_DECISIONS.map(item => item.owner)).size, note: 'ABEA, vendor, government, joint' },
          { label: 'Status', value: 'Open', note: 'Register is active' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{item.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: '#052460' }}>{item.value}</div>
            <div className="mt-2 text-xs leading-5 text-gray-500">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {OPEN_DECISIONS.map(decision => (
          <section key={decision.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase text-gray-400">{decision.id} · {decision.owner}</div>
                <h2 className="mt-2 text-lg font-black" style={{ color: '#052460' }}>{decision.title}</h2>
              </div>
              <div className="flex gap-2">
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${decision.priority === 'High' ? 'bg-red-100 text-red-700' : decision.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {decision.priority}
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{decision.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm leading-6 md:grid-cols-2">
              <div>
                <div className="mb-1 font-semibold text-gray-900">Context</div>
                <p className="text-gray-600">{decision.context}</p>
              </div>
              <div>
                <div className="mb-1 font-semibold text-gray-900">Recommendation</div>
                <p className="text-gray-600">{decision.recommendation}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
