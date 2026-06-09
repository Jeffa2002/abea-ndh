import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateTemporaryPassword } from '@/lib/passwordPolicy'
import { logSecurityEvent } from '@/lib/securityLog'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { org: true },
    omit: { passwordHash: true },
  })

  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, role, orgId } = await req.json() as {
    email?: string
    role?: UserRole
    orgId?: string
  }
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail || !role || !Object.values(UserRole).includes(role)) {
    return NextResponse.json({ error: 'Email and valid role are required' }, { status: 400 })
  }
  if (role === UserRole.MEMBER && !orgId) {
    return NextResponse.json({ error: 'Member accounts require an organisation' }, { status: 400 })
  }

  const org = orgId ? await prisma.organisation.findUnique({ where: { id: orgId } }) : null
  if (role === UserRole.MEMBER && !org) {
    return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })
  }

  const temporaryPassword = generateTemporaryPassword()
  const passwordHash = await bcrypt.hash(temporaryPassword, 12)
  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      passwordHash,
      role,
      orgId: role === UserRole.MEMBER ? orgId : null,
      approvalStatus: 'APPROVED',
      approvalNote: 'Provisioned by admin invite; password change required.',
      approvedAt: new Date(),
      approvedById: session.userId,
      mustChangePassword: true,
    },
    create: {
      email: normalizedEmail,
      passwordHash,
      role,
      orgId: role === UserRole.MEMBER ? orgId : null,
      approvalStatus: 'APPROVED',
      approvalNote: 'Provisioned by admin invite; password change required.',
      approvedAt: new Date(),
      approvedById: session.userId,
      mustChangePassword: true,
    },
    include: { org: true },
    omit: { passwordHash: true },
  })

  await logSecurityEvent({
    eventType: 'USER_INVITED',
    req,
    session,
    target: normalizedEmail,
    metadata: { role, orgId },
  })

  return NextResponse.json({ user, temporaryPassword }, { status: 201 })
}
