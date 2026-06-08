import Link from 'next/link'
import { ADMIN_CHANGELOG } from '@/lib/adminChangelog'
import { OPEN_DECISIONS } from '@/lib/openDecisions'
import { WALKTHROUGHS } from '@/lib/walkthroughs'
import { SECURITY_AUDIT_ITEMS } from '@/lib/securityAudit'

export const dynamic = 'force-dynamic'

export default function ReviewPackPage() {
  const resources = [
    { title: 'Methodology', href: '/methodology', desc: 'Public methodology, input model, process, and review questions.' },
    { title: 'Implementation Changelog', href: '/admin/changelog', desc: 'Versioned interpretation of what changed and why.' },
    { title: 'Security Audit', href: '/admin/security-audit', desc: 'Role, API, export, rejected-data, import, and Power BI access controls.' },
    { title: 'Report Builder', href: '/admin/reports?period=2025-H1', desc: 'Admin aggregate reporting and CSV export.' },
    { title: 'Government View', href: '/govt?period=2025-H1', desc: 'Aggregate trends, methodology basis, and economic impact inputs.' },
    { title: 'Power BI Guide', href: '/admin/powerbi', desc: 'Feed tables and recommended fact/dimension model.' },
    { title: 'Data Quality', href: '/admin/data-quality', desc: 'Completeness, stale contributors, rejected data, and import batches.' },
    { title: 'Open Decisions', href: '/admin/decisions', desc: 'Decision register for ABEA/vendor/government review.' },
    { title: 'Walkthroughs', href: '/admin/walkthroughs', desc: 'Guided scripts for each reviewer audience.' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Stakeholder Review Pack</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          One place to run an ABEA, vendor, government, or Power BI review session. Start here, then branch into methodology, reports, security, decisions, and guided walkthroughs.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Current version', value: ADMIN_CHANGELOG[0].version, note: ADMIN_CHANGELOG[0].title },
          { label: 'Open decisions', value: OPEN_DECISIONS.length, note: 'Awaiting stakeholder input' },
          { label: 'Walkthroughs', value: WALKTHROUGHS.length, note: 'Admin, member, government, BI' },
          { label: 'Security checks', value: SECURITY_AUDIT_ITEMS.length, note: 'Access/export/feed controls' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{item.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: '#052460' }}>{item.value}</div>
            <div className="mt-2 text-xs leading-5 text-gray-500">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
        Suggested review order: Methodology, Government View, Report Builder, Data Quality, Power BI Guide, Security Audit, Open Decisions, then role-specific walkthroughs.
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {resources.map(resource => (
          <Link key={resource.href} href={resource.href} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors hover:border-orange-300">
            <div className="text-lg font-black" style={{ color: '#052460' }}>{resource.title}</div>
            <p className="mt-3 text-sm leading-6 text-gray-500">{resource.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold text-gray-900">Demo Accounts</h2>
        <div className="grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 md:grid-cols-3">
          <div><span className="font-semibold text-gray-900">Admin:</span> admin@abea.org.au</div>
          <div><span className="font-semibold text-gray-900">Government:</span> viewer@austrade.gov.au</div>
          <div><span className="font-semibold text-gray-900">Member:</span> member@sydney-icc.com.au</div>
        </div>
      </div>
    </div>
  )
}
