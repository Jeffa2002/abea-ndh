import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function SecurityEventsPage() {
  const events = await prisma.securityAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Security Events</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          Recent login, password, invite, export, and Power BI feed events. This gives ABEA an operational audit trail for sensitive access and reporting activity.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Time</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Event</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actor</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Target</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Route</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">IP</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id} className="border-b last:border-0">
                <td className="px-5 py-4 text-xs text-gray-500">{event.createdAt.toLocaleString('en-AU')}</td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-900">{event.eventType}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{event.actorEmail || 'System/token'}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{event.target || '-'}</td>
                <td className="px-5 py-4 font-mono text-xs text-gray-500">{event.method || ''} {event.route || ''}</td>
                <td className="px-5 py-4 text-xs text-gray-500">{event.ipAddress || '-'}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">No security events recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
