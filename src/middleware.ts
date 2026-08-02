import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * Protege toutes les routes /admin sauf la page de connexion.
 * Un visiteur non authentifie est redirige vers /admin/login.
 */
export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    pages: { signIn: '/admin/login' },
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/admin/login')) return true
        return Boolean(token)
      },
    },
  },
)

export const config = {
  matcher: ['/admin/:path*'],
}
