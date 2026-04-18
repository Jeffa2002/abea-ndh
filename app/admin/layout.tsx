import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { COOKIE_NAME } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')

  const navItems = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/organisations', label: 'Organisations', icon: '🏢' },
    { href: '/admin/submissions', label: 'Submissions', icon: '📋' },
    { href: '/admin/benchmarks', label: 'Benchmarks', icon: '📈' },
    { href: '/admin/members', label: 'Members', icon: '👥' },
  ]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F8FAFC' }}>
      <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: '#0d1f33' }}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded" style={{ backgroundColor: '#00A99D' }} />
            <span className="text-white font-bold text-sm leading-tight">ABEA Admin<br/><span className="text-white/50 font-normal">Control Panel</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm mb-1 transition-colors">
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-white/50 text-xs mb-3">{session.email}</div>
          <form action={async () => {
            'use server'
            const { cookies } = await import('next/headers')
            const { COOKIE_NAME } = await import('@/lib/auth')
            const { redirect } = await import('next/navigation')
            const cookieStore = await cookies()
            cookieStore.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
            redirect('/')
          }}>
            <button type="submit" className="w-full text-left px-3 py-2 text-white/60 hover:text-white text-xs rounded">Sign Out →</button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
