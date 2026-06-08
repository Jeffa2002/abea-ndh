import { prisma } from '@/lib/prisma'
import { REPORTING_MIN_SAMPLE_SIZE } from '@/lib/privacy'

export const dynamic = 'force-dynamic'

export default async function ReportPacksPage() {
  const periods = await prisma.dataSubmission.findMany({
    where: { status: 'PROCESSED' },
    distinct: ['period'],
    select: { period: true },
    orderBy: { period: 'desc' },
  })
  const defaultPeriod = periods[0]?.period || '2025-H1'
  const audiences = [
    { value: 'board', label: 'Board summary', desc: 'Executive-level progress, trends, data quality, and open decisions.' },
    { value: 'government', label: 'Government report', desc: 'Methodology basis, economic inputs, benchmark samples, and privacy caveats.' },
    { value: 'internal', label: 'Internal data review', desc: 'Data quality, imports, exclusions, coverage, and report-readiness notes.' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Report Packs</h1>
        <p className="max-w-3xl text-sm leading-6 text-gray-500">
          Generate shareable PDF packs for stakeholder meetings. Packs use processed, non-excluded records and apply the reporting privacy threshold.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {audiences.map(audience => (
          <div key={audience.value} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-black" style={{ color: '#052460' }}>{audience.label}</h2>
            <p className="mt-3 text-sm leading-6 text-gray-500">{audience.desc}</p>
            <div className="mt-5 space-y-3">
              {periods.map(period => (
                <a
                  key={`${audience.value}-${period.period}`}
                  href={`/api/admin/report-packs/export?period=${period.period}&audience=${audience.value}`}
                  className="block rounded-lg px-4 py-2 text-center text-sm font-bold text-white"
                  style={{ backgroundColor: '#052460' }}
                >
                  Export {period.period}
                </a>
              ))}
              {periods.length === 0 && (
                <a
                  href={`/api/admin/report-packs/export?period=${defaultPeriod}&audience=${audience.value}`}
                  className="block rounded-lg px-4 py-2 text-center text-sm font-bold text-white"
                  style={{ backgroundColor: '#052460' }}
                >
                  Export {defaultPeriod}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-800">
        Current privacy threshold: n={REPORTING_MIN_SAMPLE_SIZE}. Aggregate values below this sample size are suppressed in report packs and aggregate exports.
      </div>
    </div>
  )
}
