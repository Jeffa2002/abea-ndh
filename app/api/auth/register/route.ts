// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Pillar, UserRole } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const { orgName, pillar, region, tier, email, password } = await req.json()
    if (!orgName || !pillar || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

    const org = await prisma.organisation.create({
      data: { name: orgName, slug, pillar: pillar as Pillar, region, tier, isApproved: false },
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
