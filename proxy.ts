import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'abea_token'
const PROTECTED = ['/dashboard', '/admin', '/govt', '/account', '/api/data', '/api/admin', '/api/account']
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function hasSameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const expectedHosts = new Set([
    req.nextUrl.host,
    req.headers.get('host'),
    req.headers.get('x-forwarded-host'),
  ].filter(Boolean))
  try {
    if (origin) return expectedHosts.has(new URL(origin).host)
    if (referer) return expectedHosts.has(new URL(referer).host)
  } catch {
    return false
  }
  return false
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/api/') && UNSAFE_METHODS.has(req.method) && !hasSameOrigin(req)) {
    return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 })
  }

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const passwordChangeAllowed = pathname.startsWith('/account/password') ||
      pathname.startsWith('/api/account/password') ||
      pathname.startsWith('/api/auth/logout')
    if (payload.mustChangePassword === true && !passwordChangeAllowed) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Password change required' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/account/password', req.url))
    }

    // Role-based access
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname.startsWith('/govt') && payload.role !== 'ADMIN' && payload.role !== 'GOVT_VIEWER') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  } catch {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/govt/:path*', '/account/:path*', '/api/:path*'],
}
