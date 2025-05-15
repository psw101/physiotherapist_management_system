import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/prisma/client";
import { adapter } from "next/dist/server/web/adapter";
import { Session } from "inspector/promises";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password", placeholder: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(credentials!.password, user!.hashedPassword!);
        return passwordsMatch ? user : null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  // Add these configurations
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    newUser: '/register'
  },
  callbacks: {
    // Add a custom redirect callback
    async redirect({ url, baseUrl }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } 
      // If the URL is already absolute but on the same host, allow it
      else if (url.startsWith(baseUrl)) {
        return url;
      }
      // Redirect to home page as fallback
      return baseUrl;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };