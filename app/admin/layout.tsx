import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/login')
  if (session.mustChangePassword) redirect('/account/password')

  const navItems = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/review-pack', label: 'Review Pack', icon: '🧩' },
    { href: '/admin/intelligence', label: 'Intelligence Hub', icon: '🧠' },
    { href: '/admin/forward-calendar', label: 'Forward Calendar', icon: '🗓️' },
    { href: '/admin/event-commercials', label: 'Event Commercials', icon: '💹' },
    { href: '/admin/bid-pipeline', label: 'Bid Pipeline', icon: '🎯' },
    { href: '/admin/brand', label: 'Brand Guide', icon: '🎨' },
    { href: '/admin/organisations', label: 'Organisations', icon: '🏢' },
    { href: '/admin/submissions', label: 'Submissions', icon: '📋' },
    { href: '/admin/imports', label: 'Imports', icon: '📥' },
    { href: '/admin/data-quality', label: 'Data Quality', icon: '🧭' },
    { href: '/admin/reports', label: 'Reports', icon: '📑' },
    { href: '/admin/report-packs', label: 'Report Packs', icon: '📦' },
    { href: '/admin/powerbi', label: 'Power BI', icon: '⚡' },
    { href: '/admin/security-audit', label: 'Security Audit', icon: '🔐' },
    { href: '/admin/security-events', label: 'Security Events', icon: '🧾' },
    { href: '/admin/decisions', label: 'Decisions', icon: '✅' },
    { href: '/admin/walkthroughs', label: 'Walkthroughs', icon: '🧭' },
    { href: '/admin/benchmarks', label: 'Benchmarks', icon: '📈' },
    { href: '/admin/members', label: 'Members', icon: '👥' },
    { href: '/admin/changelog', label: 'Changelog', icon: '📝' },
  ]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#EFEEEE' }}>
      <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: '#052460' }}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="block">
            <Image src="/brand/abea-logo-foot.png" alt="Australian Business Events Association" width={236} height={49} className="abea-logo h-12 w-auto max-w-[190px]" />
            <span className="mt-3 block text-white/60 text-xs font-semibold uppercase tracking-wide">Admin Control Panel</span>
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
