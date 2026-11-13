import type { NextAuthOptions, DefaultSession } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase'
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
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) throw new Error('Identifiants invalides.')

        const { email, password } = parsed.data
        // Supabase Auth owns password validation and its own abuse protection.
        const { data: authData, error: authError } = await getSupabasePublic().auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        })
        if (authError || !authData.user) throw new Error('Identifiants invalides.')

        const userEmail = authData.user.email?.toLowerCase() ?? email.toLowerCase()
        const { data: profile, error: profileError } = await getSupabaseAdmin()
          .from('users').select('id,name,role,active').eq('email', userEmail).maybeSingle()
        if (profileError) throw profileError

        const metadataRole = authData.user.app_metadata?.role
        const role = (['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(metadataRole)
          ? metadataRole
          : profile?.role) as Role | undefined
        const isConfiguredAdmin = userEmail === process.env.ADMIN_EMAIL?.trim().toLowerCase()
        if ((profile && !profile.active) || (!role && !isConfiguredAdmin)) {
          throw new Error('Ce compte ne dispose pas des droits administrateur.')
        }

        if (profile) {
          const { error: updateError } = await getSupabaseAdmin().from('users')
            .update({ lastLoginAt: new Date().toISOString() }).eq('id', profile.id)
          if (updateError) console.error('[auth] could not update last login')
        }

        return {
          id: profile?.id ?? authData.user.id,
          name: profile?.name ?? authData.user.user_metadata?.name ?? userEmail,
          email: userEmail,
          role: role ?? 'SUPER_ADMIN',
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
