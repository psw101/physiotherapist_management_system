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
        
        const dbUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!dbUser) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password, 
          dbUser.hashedPassword || ''
        );
        
        if (!passwordsMatch) return null;
        
        // Convert null to undefined for role to match NextAuth's User type
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
          // Convert null to undefined to fix type error
          role: dbUser.role || undefined
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user ID to token if present in user object
      if (user?.id) {
        token.id = user.id;
      }

      // For every token refresh, get the latest user data including role
      if (token.email) {
        // Get the user from the database with their role
        const userDB = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { id: true, role: true },
        });

        // Set role directly from database
        if (userDB?.role) {
          token.role = userDB.role;
        } else {
          token.role = "PATIENT"; // Default fallback
        }

        // Check if user has a patient profile
        const patient = await prisma.patient.findUnique({
          where: { email: token.email as string },
        });

        token.hasPatientProfile = !!patient;

        if (patient) {
          token.patientId = patient.id;
        }
      }

      // Log for debugging
      console.log("JWT Token:", {
        id: token.id,
        email: token.email,
        role: token.role,
        hasPatientProfile: token.hasPatientProfile,
      });

      return token;
    },

    //   jwt: async ({ token, user }) => {
    //   if (user) {
    //     token.role = user.role;
    //     token.id = user.id;
    //   }
    //   return token;
    // },
    // session: async ({ session, token }) => {
    //   if (token && session.user) {
    //     session.user.role = token.role as string;
    //     session.user.id = token.id as string;
    //   }
    //   return session;
    // },

    async session({ session, token }) {
      if (session.user) {
        // Define these properties in your types/next-auth.d.ts
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.hasPatientProfile = token.hasPatientProfile as boolean;
        
        if (token.patientId) {
          session.user.patientId = token.patientId as number;
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
