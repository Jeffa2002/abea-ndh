'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const PILLARS = ['VENUE', 'ORGANISER', 'SUPPLIER', 'BUREAU']
const TIERS = ['SME', 'Mid', 'Large']
const REGIONS = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']

export default function RegisterPage() {
  const [form, setForm] = useState({ orgName: '', pillar: '', region: '', tier: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEEEE' }}>
        <nav style={{ backgroundColor: '#052460' }} className="px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-4">
            <Image src="/brand/abea-logo-foot.png" alt="Australian Business Events Association" width={236} height={49} className="abea-logo h-12 w-auto max-w-[210px]" priority />
            <span className="hidden sm:inline text-white/70 text-sm font-semibold border-l border-white/20 pl-4">National Data Hub</span>
          </Link>
        </nav>
        <div className="flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-lg text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E8F8F7' }}>
              <span className="text-3xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#052460' }}>Registration Submitted!</h1>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Your registration for <strong>{form.orgName}</strong> is now pending review by the ABEA team.
            </p>
            <div className="p-4 rounded-xl mb-6 text-sm" style={{ backgroundColor: '#E8F8F7', color: '#F99F38' }}>
              <strong>What happens next?</strong><br />
              You&apos;ll receive an email at <strong>{form.email}</strong> once your account has been approved. This usually takes 1–2 business days.
            </div>
            <div className="space-y-3 text-sm text-gray-500">
              <p>Questions? Contact us at <a href="mailto:support@abea.org.au" className="font-semibold" style={{ color: '#F99F38' }}>support@abea.org.au</a></p>
              <p><Link href="/login" className="font-semibold" style={{ color: '#052460' }}>← Back to Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFEEEE' }}>
      <nav style={{ backgroundColor: '#052460' }} className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-4">
          <Image src="/brand/abea-logo-foot.png" alt="Australian Business Events Association" width={236} height={49} className="abea-logo h-12 w-auto max-w-[210px]" priority />
          <span className="hidden sm:inline text-white/70 text-sm font-semibold border-l border-white/20 pl-4">National Data Hub</span>
        </Link>
      </nav>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Register Your Organisation</h1>
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
              style={{ backgroundColor: '#052460' }}>
              {loading ? 'Registering...' : 'Register Organisation'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already registered? <Link href="/login" className="font-semibold" style={{ color: '#F99F38' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
