import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validatePassword } from '@/lib/passwordPolicy'
import { logSecurityEvent } from '@/lib/securityLog'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json() as {
    currentPassword?: string
    newPassword?: string
  }
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) {
    await logSecurityEvent({ eventType: 'PASSWORD_CHANGE_FAILED', req, session, target: session.email })
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  const policy = validatePassword(newPassword, { email: user.email })
  if (!policy.valid) {
    return NextResponse.json({ error: 'Password does not meet policy', details: policy.failures }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false, passwordChangedAt: new Date() },
  })
  await logSecurityEvent({ eventType: 'PASSWORD_CHANGED', req, session, target: user.email })

  return NextResponse.json({
    ok: true,
    redirectTo: user.role === 'ADMIN' ? '/admin' : user.role === 'GOVT_VIEWER' ? '/govt' : '/dashboard',
  })
}
