'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function PasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setLoading(true)
    const res = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.details?.join(' ') || data.error || 'Password change failed')
      return
    }
    setMessage('Password updated. Redirecting...')
    setTimeout(() => { window.location.href = data.redirectTo || '/dashboard' }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EFEEEE' }}>
      <nav style={{ backgroundColor: '#052460' }} className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-4">
          <Image src="/brand/abea-logo-foot.png" alt="Australian Business Events Association" width={236} height={49} className="abea-logo h-12 w-auto max-w-[210px]" priority />
          <span className="hidden sm:inline text-white/70 text-sm font-semibold border-l border-white/20 pl-4">National Data Hub</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#052460' }}>Change Password</h1>
          <p className="text-gray-500 mb-8 text-sm">Set a private password before continuing.</p>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          {message && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{message}</div>}

          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Current password</span>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">New password</span>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</span>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900" />
            </label>
            <div className="rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-500">
              Use at least 14 characters with uppercase, lowercase, number, and symbol.
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60" style={{ backgroundColor: loading ? '#1C4DA1' : '#052460' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
