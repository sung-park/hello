import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      return user.email === process.env.ALLOWED_EMAIL
    },
  },
})
