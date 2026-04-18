'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PILLARS = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU']
const TIERS = ['SME', 'Mid', 'Large']
const REGIONS = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ orgName: '', pillar: '', region: '', tier: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Registration failed'); return }
    router.push('/login?registered=1')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <nav style={{ backgroundColor: '#1E3A5F' }} className="px-6 py-4">
        <Link href="/" className="text-white font-bold text-lg">← ABEA National Data Hub</Link>
      </nav>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>Register Your Organisation</h1>
          <p className="text-gray-500 mb-8 text-sm">Join the national business events data community</p>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name</label>
              <input type="text" required value={form.orgName} onChange={e => update('orgName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
                placeholder="e.g. Melbourne Convention & Exhibition Centre" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pillar</label>
                <select required value={form.pillar} onChange={e => update('pillar', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white">
                  <option value="">Select...</option>
                  {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Territory</label>
                <select required value={form.region} onChange={e => update('region', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white">
                  <option value="">Select...</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                <select required value={form.tier} onChange={e => update('tier', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white">
                  <option value="">Select...</option>
                  {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
                placeholder="you@organisation.com.au" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={form.password} onChange={e => update('password', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
                placeholder="Minimum 8 characters" />
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-xs text-blue-700">
              <strong>Note:</strong> Your organisation will require admin approval before accessing the dashboard. You&apos;ll be notified when approved.
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: '#1E3A5F' }}>
              {loading ? 'Registering...' : 'Register Organisation'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already registered? <Link href="/login" className="font-semibold" style={{ color: '#00A99D' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
