import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'abea_token'
const PROTECTED = ['/dashboard', '/admin', '/govt', '/api/data', '/api/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
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
  matcher: ['/dashboard/:path*', '/admin/:path*', '/govt/:path*', '/api/data/:path*', '/api/admin/:path*'],
}
