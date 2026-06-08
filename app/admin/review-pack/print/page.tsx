import { ADMIN_CHANGELOG } from '@/lib/adminChangelog'
import { OPEN_DECISIONS } from '@/lib/openDecisions'
import { WALKTHROUGHS } from '@/lib/walkthroughs'
import { SECURITY_AUDIT_ITEMS } from '@/lib/securityAudit'

export const dynamic = 'force-dynamic'

export default function ReviewPackPrintPage() {
  return (
    <div className="bg-white p-10 text-gray-900 print:p-0">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 border-b pb-6">
          <div className="text-xs font-bold uppercase text-gray-400">ABEA National Data Hub</div>
          <h1 className="mt-3 text-4xl font-black" style={{ color: '#052460' }}>Stakeholder Review Pack</h1>
          <p className="mt-4 text-sm leading-7 text-gray-600">
            Printable meeting pack covering implementation history, open decisions, security controls, and audience walkthroughs.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-black" style={{ color: '#052460' }}>Implementation Summary</h2>
          {ADMIN_CHANGELOG.slice(0, 4).map(entry => (
            <div key={entry.version} className="mb-5 break-inside-avoid rounded-lg border p-5">
              <div className="text-xs font-bold uppercase text-gray-400">{entry.version} · {entry.date}</div>
              <h3 className="mt-2 font-bold">{entry.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{entry.intent}</p>
            </div>
          ))}
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-black" style={{ color: '#052460' }}>Open Decisions</h2>
          {OPEN_DECISIONS.map(decision => (
            <div key={decision.id} className="mb-4 break-inside-avoid rounded-lg border p-5">
              <div className="text-xs font-bold uppercase text-gray-400">{decision.id} · {decision.owner} · {decision.priority}</div>
              <h3 className="mt-2 font-bold">{decision.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{decision.recommendation}</p>
            </div>
          ))}
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-black" style={{ color: '#052460' }}>Security Controls</h2>
          <div className="grid grid-cols-1 gap-3">
            {SECURITY_AUDIT_ITEMS.map(item => (
              <div key={`${item.area}-${item.check}`} className="break-inside-avoid rounded-lg border p-4">
                <div className="text-sm font-bold">{item.area}</div>
                <p className="mt-1 text-xs leading-5 text-gray-600">{item.check}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-black" style={{ color: '#052460' }}>Walkthrough Scripts</h2>
          {WALKTHROUGHS.map(walkthrough => (
            <div key={walkthrough.audience} className="mb-5 break-inside-avoid rounded-lg border p-5">
              <div className="text-xs font-bold uppercase text-gray-400">{walkthrough.account}</div>
              <h3 className="mt-2 font-bold">{walkthrough.audience}</h3>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-gray-600">
                {walkthrough.steps.map(step => <li key={step}>{step}</li>)}
              </ol>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
