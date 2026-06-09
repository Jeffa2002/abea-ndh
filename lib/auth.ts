import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME = 'abea_token'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  orgId?: string
  pillar?: string
  mustChangePassword?: boolean
}

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!)
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { org: true },
  })
  if (!user || user.approvalStatus === 'PENDING' || user.approvalStatus === 'REJECTED') return null

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    orgId: user.orgId ?? undefined,
    pillar: user.org?.pillar ?? undefined,
    mustChangePassword: user.mustChangePassword,
  }
}

export { COOKIE_NAME }
