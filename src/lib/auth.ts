import type { NextAuthOptions, DefaultSession } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { isLoginBlocked, recordLoginAttempt } from '@/lib/rate-limit'
import { loginSchema } from '@/validations/auth'
import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: { id: string; role: Role } & DefaultSession['user']
  }
  interface User {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  pages: { signIn: '/admin/login', error: '/admin/login' },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) throw new Error('Identifiants invalides.')

        const { email, password } = parsed.data
        const ip =
          headers().get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'inconnue'

        if (await isLoginBlocked(email, ip)) {
          throw new Error('Trop de tentatives. Reessayez dans 15 minutes.')
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!user || !user.active) {
          await recordLoginAttempt(email, ip, false)
          throw new Error('Identifiants invalides.')
        }

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) {
          await recordLoginAttempt(email, ip, false)
          throw new Error('Identifiants invalides.')
        }

        await recordLoginAttempt(email, ip, true)
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
}

/** Session cote serveur. */
export function auth() {
  return getServerSession(authOptions)
}

/** Leve une erreur si aucune session admin valide. */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) throw new Error("Acces refuse : authentification requise.")
  return session.user
}
