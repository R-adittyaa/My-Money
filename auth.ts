import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByUsername, verifyPassword } from "@/lib/auth-helpers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = (credentials?.username as string)?.trim();
        const password = (credentials?.password as string)?.trim();

        if (!username || !password) return null;

        const user = await findUserByUsername(username);
        if (!user) return null;

        const valid = await verifyPassword(user, password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.displayName,
          email: `${user.username}@mymoney.local`,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});