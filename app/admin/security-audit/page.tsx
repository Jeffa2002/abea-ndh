import { SECURITY_AUDIT_ITEMS } from '@/lib/securityAudit'

export const dynamic = 'force-dynamic'

export default function SecurityAuditPage() {
  const highRisk = SECURITY_AUDIT_ITEMS.filter(item => item.risk === 'High').length
  const passCount = SECURITY_AUDIT_ITEMS.filter(item => item.status === 'Pass').length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Security Access Audit</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          Admin review matrix for roles, exports, reporting feeds, rejected data, and excluded imports before external stakeholder review.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: 'Checks', value: SECURITY_AUDIT_ITEMS.length, note: 'Access and data-leak surfaces' },
          { label: 'Passing', value: passCount, note: 'Current implementation status' },
          { label: 'High-risk surfaces', value: highRisk, note: 'Admin/API/export boundaries' },
          { label: 'Review cadence', value: 'Before pilots', note: 'Repeat before real onboarding' },
        ].map(item => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase text-gray-400">{item.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: '#052460' }}>{item.value}</div>
            <div className="mt-2 text-xs leading-5 text-gray-500">{item.note}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
        This page records implementation controls. It should be paired with live smoke checks after each deploy, especially for admin exports, government reporting, and Power BI feed access.
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Area</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Check</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Expected Control</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Risk</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {SECURITY_AUDIT_ITEMS.map(item => (
              <tr key={`${item.area}-${item.check}`} className="border-b align-top last:border-0">
                <td className="px-5 py-4 text-sm font-semibold text-gray-900">{item.area}</td>
                <td className="px-5 py-4 text-sm leading-6 text-gray-700">{item.check}</td>
                <td className="px-5 py-4 text-sm leading-6 text-gray-600">{item.expected}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.risk === 'High' ? 'bg-red-100 text-red-700' : item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {item.risk}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
