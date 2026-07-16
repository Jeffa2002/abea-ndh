import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function status(summary: unknown) {
  const value = summary && typeof summary === 'object' && 'reportReconciliation' in summary ? String((summary as Record<string, unknown>).reportReconciliation) : 'NOT_APPLICABLE'
  if (value.startsWith('PASSED')) return { value, cls: 'bg-green-100 text-green-700' }
  if (value === 'PARTIAL') return { value, cls: 'bg-yellow-100 text-yellow-700' }
  if (value === 'REVIEW_REQUIRED') return { value, cls: 'bg-red-100 text-red-700' }
  return { value, cls: 'bg-gray-100 text-gray-600' }
}

export default async function IntelligenceHubPage() {
  const datasets = await prisma.intelligenceDataset.findMany({ orderBy: [{ domain: 'asc' }, { asOfLabel: 'desc' }], include: { _count: { select: { forwardSummaries: true, reasons: true, commercialEvents: true, bidRecords: true } } } })
  const domains = new Set(datasets.map(item => item.domain)).size
  const rows = datasets.reduce((sum,item)=>sum+item.rowCount,0)
  const warnings = datasets.filter(item => status(item.validationSummary).value === 'REVIEW_REQUIRED' || status(item.validationSummary).value === 'PARTIAL').length
  return <div className="p-8">
    <div className="mb-8"><div className="text-xs font-bold uppercase tracking-wide text-orange-600">Governed intelligence</div><h1 className="mt-2 text-3xl font-black" style={{color:'#052460'}}>Event Intelligence Hub</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">Source-aware scenario analytics for Forward Calendar reporting, event commercials and the dummy bid pipeline. Scenario data is isolated from official member benchmarks.</p></div>
    <div className="mb-8 grid gap-4 md:grid-cols-4">{[
      ['Datasets',datasets.length,'Versioned source packs'],['Source rows',rows.toLocaleString(),'Declared source coverage'],['Domains',domains,'Calendar, commercial, bids'],['Reconciliation warnings',warnings,'Require review before publication'],
    ].map(([label,value,note])=><div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="text-xs font-bold uppercase text-gray-400">{label}</div><div className="mt-2 text-3xl font-black" style={{color:'#052460'}}>{value}</div><div className="mt-2 text-xs text-gray-500">{note}</div></div>)}</div>
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <Link href="/admin/forward-calendar" className="rounded-2xl bg-[#052460] p-6 text-white"><div className="text-xs font-bold uppercase text-white/60">Bureaux</div><div className="mt-2 text-xl font-black">Forward Calendar →</div><p className="mt-2 text-xs leading-5 text-white/70">Won, lost, pipeline, spend, delegates and reason comparisons.</p></Link>
      <Link href="/admin/event-commercials" className="rounded-2xl bg-[#F99F38] p-6 text-white"><div className="text-xs font-bold uppercase text-white/70">Organisers</div><div className="mt-2 text-xl font-black">Event Commercials →</div><p className="mt-2 text-xs leading-5 text-white/80">Cost mix, gross contribution, registration origin and known revenue yield.</p></Link>
      <Link href="/admin/bid-pipeline" className="rounded-2xl bg-[#00A7E2] p-6 text-white"><div className="text-xs font-bold uppercase text-white/70">Synthetic pilot</div><div className="mt-2 text-xl font-black">Bid Pipeline →</div><p className="mt-2 text-xs leading-5 text-white/80">Prospect triage and descriptive historical signals—no predictive model.</p></Link>
    </div>
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><div className="border-b p-5"><h2 className="font-bold text-gray-900">Dataset register and lineage</h2><p className="mt-1 text-xs text-gray-500">Exact source identity, scenario classification and report-reconciliation state.</p></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b bg-gray-50">{['Dataset','Domain','As at','Rows','Confidentiality','Reconciliation','Source'].map(x=><th key={x} className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">{x}</th>)}</tr></thead><tbody>{datasets.map(item=>{const s=status(item.validationSummary);return <tr key={item.id} className="border-b last:border-0"><td className="px-4 py-4 text-sm font-bold text-gray-900">{item.name}<div className="mt-1 text-xs font-normal text-gray-400">{item.isScenario?'Scenario / review data':'Official data'}</div></td><td className="px-4 py-4 text-xs text-gray-600">{item.domain.replaceAll('_',' ')}</td><td className="px-4 py-4 text-xs text-gray-600">{item.asOfLabel||'—'}</td><td className="px-4 py-4 text-sm text-gray-700">{item.rowCount}</td><td className="px-4 py-4 text-xs text-gray-600">{item.confidentiality.replaceAll('_',' ')}</td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${s.cls}`}>{s.value.replaceAll('_',' ')}</span></td><td className="max-w-xs px-4 py-4 text-xs text-gray-500"><div className="truncate">{item.sourceFilename}</div>{item.sourceHash&&<div className="mt-1 truncate font-mono text-[10px] text-gray-300">{item.sourceHash}</div>}</td></tr>})}</tbody></table></div></div>
  </div>
}
