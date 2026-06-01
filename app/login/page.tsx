'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      // Hard redirect so browser picks up the cookie before navigating
      const role = data.user.role
      if (role === 'ADMIN') window.location.href = '/admin'
      else if (role === 'GOVT_VIEWER') window.location.href = '/govt'
      else window.location.href = '/dashboard'
    } catch (err) {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8FAFC' }}>
      <nav style={{ backgroundColor: '#052460' }} className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-4">
          <Image src="/brand/abea-logo-foot.png" alt="Australian Business Events Association" width={236} height={49} className="abea-logo h-12 w-auto max-w-[210px]" priority />
          <span className="hidden sm:inline text-white/70 text-sm font-semibold border-l border-white/20 pl-4">National Data Hub</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Sign In</h1>
          <p className="text-gray-500 mb-8 text-sm">Access your organisation&apos;s data hub</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60"
              style={{ backgroundColor: loading ? '#1C4DA1' : '#052460' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold" style={{ color: '#F99F38' }}>Register your organisation</Link>
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
