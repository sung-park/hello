import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  trustHost: true,
  pages: { signIn: '/admin/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      if (nextUrl.pathname === '/admin/login') return true
      return isLoggedIn
    },
  },
} satisfies NextAuthConfig
