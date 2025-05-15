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
  callbacks: {
  // Add only the session callback to fetch role from database
  async jwt({ token, user, account }) {
      // Initial sign in
      // if (user) {
      //   // For first-time sign in, add user properties to token
      //   token.id = user.id;
      //   token.role = user.role || "PATIENT"; // Default role if none exists
      // }
      
      // For Google sign-ins where we might not have a role yet
      if (account?.provider === "google" && !token.role) {
        // Fetch user from database to get their role
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true }
        });
        
        // Set role from database or default to PATIENT
        token.role = (dbUser?.role as string) || "PATIENT";
      }
      
      return token;
    },
  // Simple redirect callback that sends users to dashboard
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to dashboard
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/`;
      }
      // For relative URLs
      else if (url.startsWith('/')) {
        return `${baseUrl}/`;
      }
      // For absolute URLs, default to baseUrl/dashboard
      return `${baseUrl}/`;
    }
  },

};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

