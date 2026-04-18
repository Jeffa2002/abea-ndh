'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Login failed'); return }

    const role = data.user.role
    if (role === 'ADMIN') router.push('/admin')
    else if (role === 'GOVT_VIEWER') router.push('/govt')
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8FAFC' }}>
      <nav style={{ backgroundColor: '#1E3A5F' }} className="px-6 py-4">
        <Link href="/" className="text-white font-bold text-lg">← ABEA National Data Hub</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1E3A5F' }}>Sign In</h1>
          <p className="text-gray-500 mb-8 text-sm">Access your organisation&apos;s data hub</p>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-gray-900"
                style={{ '--tw-ring-color': '#00A99D' } as any}
                placeholder="you@organisation.com.au"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-gray-900"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60"
              style={{ backgroundColor: '#1E3A5F' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold" style={{ color: '#00A99D' }}>Register your organisation</Link>
          </p>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
            <p className="font-semibold mb-2">Demo accounts:</p>
            <p>Admin: admin@abea.org.au / Admin2026!</p>
            <p>Govt: viewer@austrade.gov.au / Govt2026!</p>
            <p>Venue: member@sydney-icc.com.au / Member2026!</p>
            <p>Organiser: member@events-australia.com.au / Member2026!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
