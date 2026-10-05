import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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

        const validUsername = (process.env.AUTH_USERNAME || "").trim();
        const validPassword = (process.env.AUTH_PASSWORD || "").trim();

        if (!username || !password) return null;
        if (username !== validUsername) return null;
        if (password !== validPassword) return null;

        return {
          id: "1",
          name: username,
          email: `${username}@mymoney.local`,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  trustHost: true,
});