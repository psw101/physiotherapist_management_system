import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/prisma/client";
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
        return user;

        const passwordsMatch = await bcrypt.compare(credentials!.password, user!.hashedPassword!);
        return passwordsMatch ? user : null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user ID to token if present in user object
      if (user?.id) {
        token.id = user.id;
      }

      // Keep existing role handling
      if (account?.provider === "google" && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true },
        });

        token.role = (dbUser?.role as string) || "PATIENT";
      }

      // Check if user has a corresponding patient record
      if (token.email) {
        // Look up patient record with matching email
        const patient = await prisma.patient.findUnique({
          where: { email: token.email as string },
        });

        // Add hasPatientProfile flag to token
        token.hasPatientProfile = !!patient;

        // If there's a patient record, store its ID
        if (patient) {
          token.patientId = patient.id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // Pass user ID from token to session
        (session.user as any).id = token.id;

        // Pass role from token to session
        (session.user as any).role = token.role;

        // Pass patient profile status to session
        (session.user as any).hasPatientProfile = token.hasPatientProfile;

        // Add patient ID if available
        if (token.patientId) {
          (session.user as any).patientId = token.patientId;
        }
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // If it's an absolute URL that starts with the base URL
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // For relative URLs
      else if (url.startsWith("/")) {
        return new URL(url, baseUrl).toString();
      }

      // Default to base URL
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    // No need to set newUser since we'll handle redirection elsewhere
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
