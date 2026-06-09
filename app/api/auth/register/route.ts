import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { isPillar } from '@/lib/brand'
import { validatePassword } from '@/lib/passwordPolicy'
import { logSecurityEvent } from '@/lib/securityLog'

export async function POST(req: NextRequest) {
  try {
    const { orgName, pillar, region, tier, email, password } = await req.json() as {
      orgName?: string
      pillar?: string
      region?: string
      tier?: string
      email?: string
      password?: string
    }
    if (!orgName || !pillar || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!isPillar(pillar)) {
      return NextResponse.json({ error: 'Invalid pillar' }, { status: 400 })
    }
    const policy = validatePassword(password, { email })
    if (!policy.valid) {
      return NextResponse.json({ error: 'Password does not meet policy', details: policy.failures }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

    const org = await prisma.organisation.create({
      data: { name: orgName, slug, pillar, region, tier, isApproved: false },
    })

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: UserRole.MEMBER,
        orgId: org.id,
        approvalStatus: 'PENDING',
      },
    })
    await logSecurityEvent({ eventType: 'REGISTER_PENDING', req, target: email.toLowerCase(), metadata: { pillar, orgName } })

    return NextResponse.json({
      userId: user.id,
      orgId: org.id,
      pending: true,
      message: "Your registration is pending approval. You'll be notified by email once approved.",
    }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
