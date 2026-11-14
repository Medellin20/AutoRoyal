import type { NextAuthOptions, DefaultSession } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createHash, timingSafeEqual } from 'node:crypto'
import { loginSchema } from '@/validations/auth'
import type { Role } from '@/types/database'

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
      name: 'AdminPassword',
      credentials: { password: { label: 'Mot de passe', type: 'password' } },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const configuredPassword = process.env.ADMIN_PASSWORD
        if (!configuredPassword) throw new Error('ADMIN_PASSWORD n’est pas configuré dans .env.')

        const submittedDigest = createHash('sha256').update(parsed.data.password).digest()
        const configuredDigest = createHash('sha256').update(configuredPassword).digest()
        if (!timingSafeEqual(submittedDigest, configuredDigest)) return null

        return {
          id: 'env-admin',
          name: process.env.ADMIN_NAME?.trim() || 'Administrateur',
          email: process.env.ADMIN_EMAIL?.trim().toLowerCase() || 'administrateur@autoroyal.local',
          role: 'SUPER_ADMIN',
        }
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
