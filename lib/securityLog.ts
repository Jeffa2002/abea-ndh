import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { JWTPayload } from '@/lib/auth'

function requestIp(req?: NextRequest) {
  return req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req?.headers.get('x-real-ip') || undefined
}

export async function logSecurityEvent(input: {
  eventType: string
  req?: NextRequest
  session?: JWTPayload | null
  target?: string
  metadata?: Prisma.InputJsonValue
}) {
  try {
    await prisma.securityAuditLog.create({
      data: {
        eventType: input.eventType,
        actorId: input.session?.userId,
        actorEmail: input.session?.email,
        route: input.req?.nextUrl.pathname,
        method: input.req?.method,
        target: input.target,
        ipAddress: requestIp(input.req),
        userAgent: input.req?.headers.get('user-agent') || undefined,
        metadata: input.metadata,
      },
    })
  } catch (error) {
    console.error('Failed to write security audit log', error)
  }
}
