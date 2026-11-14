import type { NextAuthOptions, DefaultSession } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getSupabasePublic } from '@/lib/supabase'
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
      name: 'SupabaseAuth',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { data, error } = await getSupabasePublic().auth.signInWithPassword({
          email: parsed.data.email.toLowerCase(),
          password: parsed.data.password,
        })
        if (error || !data.user) return null

        const role = data.user.app_metadata?.role
        if (role !== 'admin' && role !== 'SUPER_ADMIN') return null

        return {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email || 'Administrateur',
          email: data.user.email,
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
