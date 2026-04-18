// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { org: true },
    })

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Block pending users
    if (user.approvalStatus === 'PENDING') {
      return NextResponse.json(
        { error: 'Your account is pending approval by the ABEA team.' },
        { status: 403 }
      )
    }

    // Block rejected users
    if (user.approvalStatus === 'REJECTED') {
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
    })

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, orgId: user.orgId, pillar: user.org?.pillar }
    })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
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
