import { prisma } from '@/lib/prisma'

const WINDOW_MINUTES = 15
const MAX_ATTEMPTS = 5

/** Verifie si l'email ou l'IP a depasse le quota de tentatives de connexion. */
export async function isLoginBlocked(email: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000)

  const failed = await prisma.loginAttempt.count({
    where: {
      success: false,
      createdAt: { gte: since },
      OR: [{ email: email.toLowerCase() }, { ip }],
    },
  })

  return failed >= MAX_ATTEMPTS
}

export async function recordLoginAttempt(email: string, ip: string, success: boolean) {
  await prisma.loginAttempt.create({
    data: { email: email.toLowerCase(), ip, success },
  })

  if (success) {
    // On purge l'historique d'echecs apres une connexion reussie.
    await prisma.loginAttempt.deleteMany({
      where: { email: email.toLowerCase(), success: false },
    })
  }
}
