import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'
import { checkRateLimit, rateLimitKey } from '@/lib/rateLimit'
import { logSecurityEvent } from '@/lib/securityLog'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email?: string; password?: string }
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const ipAddress = forwardedFor || req.headers.get('x-real-ip') || 'unknown'
    const rateLimit = checkRateLimit(rateLimitKey(['login', email, forwardedFor || req.headers.get('x-real-ip')]))
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
      )
    }

    const recentFailedAttempts = await prisma.securityAuditLog.count({
      where: {
        eventType: 'LOGIN_FAILED',
        target: email.toLowerCase(),
        ipAddress,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    })
    if (recentFailedAttempts >= 10) {
      await logSecurityEvent({ eventType: 'LOGIN_RATE_LIMITED', req, target: email.toLowerCase() })
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(15 * 60) } }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { org: true },
    })

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      await logSecurityEvent({ eventType: 'LOGIN_FAILED', req, target: email.toLowerCase() })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Block pending users
    if (user.approvalStatus === 'PENDING') {
      await logSecurityEvent({ eventType: 'LOGIN_BLOCKED_PENDING', req, target: email.toLowerCase() })
      return NextResponse.json(
        { error: 'Your account is pending approval by the ABEA team.' },
        { status: 403 }
      )
    }

    // Block rejected users
    if (user.approvalStatus === 'REJECTED') {
      await logSecurityEvent({ eventType: 'LOGIN_BLOCKED_REJECTED', req, target: email.toLowerCase() })
      return NextResponse.json(
        { error: 'Your registration was not approved. Contact support@abea.org.au' },
        { status: 403 }
      )
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId ?? undefined,
      pillar: user.org?.pillar ?? undefined,
      mustChangePassword: user.mustChangePassword,
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    await logSecurityEvent({
      eventType: 'LOGIN_SUCCESS',
      req,
      session: { userId: user.id, email: user.email, role: user.role, orgId: user.orgId ?? undefined, pillar: user.org?.pillar ?? undefined },
      target: user.email,
    })

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, orgId: user.orgId, pillar: user.org?.pillar, mustChangePassword: user.mustChangePassword }
    })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
