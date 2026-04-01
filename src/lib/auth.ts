import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.pin) {
          return null;
        }

        const adminPin = process.env.ADMIN_PIN;

        if (!adminPin) {
          console.error("ADMIN_PIN not set");
          return null;
        }

        if (credentials.pin !== adminPin) {
          return null;
        }

        return {
          id: "1",
          email: "admin",
          name: "Admin",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
