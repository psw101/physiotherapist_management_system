import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Define user roles for type safety and consistency
export enum UserRole {
  ADMIN = "ADMIN",
  PATIENT = "PATIENT",
  PHYSIOTHERAPIST = "PHYSIOTHERAPIST",
  RECEPTIONIST = "RECEPTIONIST"
}

// Define the protected route patterns for each role
const protectedRoutes = {
  admin: /^\/admin(?:\/.*)?$/,      // Any route starting with /admin
  patient: /^\/patient(?:\/.*)?$/,  // Any route starting with /patient
  physiotherapist: /^\/physiotherapist(?:\/.*)?$/, // Any route starting with /physiotherapist
  receptionist: /^\/receptionist(?:\/.*)?$/,      // Any route starting with /receptionist
  dashboard: /^\/dashboard(?:\/.*)?$/,  // Dashboard routes
};

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/about",
  "/contact",
  "/favicon.ico",
  "/_next"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to public routes without authentication
  for (const route of publicRoutes) {
    if (pathname.startsWith(route)) {
      return NextResponse.next();
    }
  }

  // Get the user's token and extract role
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // No token means user is not authenticated
  if (!token) {
    // Redirect to login with callback URL to return after login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  const userRole = token.role as string || UserRole.PATIENT;
  
  // Check for role-based access restrictions
  
  // Admin routes
  if (protectedRoutes.admin.test(pathname)) {
    if (userRole !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  // Patient routes
  if (protectedRoutes.patient.test(pathname)) {
    if (userRole !== UserRole.PATIENT && userRole !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  // Physiotherapist routes
  if (protectedRoutes.physiotherapist.test(pathname)) {
    if (userRole !== UserRole.PHYSIOTHERAPIST && userRole !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  // Receptionist routes
  if (protectedRoutes.receptionist.test(pathname)) {
    if (userRole !== UserRole.RECEPTIONIST && userRole !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  // Dashboard access - everyone can access their appropriate dashboard
  if (protectedRoutes.dashboard.test(pathname)) {
    // Each role should be redirected to their specific dashboard
    const dashboardPath = `/${userRole.toLowerCase()}/dashboard`;
    
    // If they're trying to access the generic dashboard, redirect to role-specific one
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  // Allow access if all checks pass
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, api routes that aren't auth-related, and _next
    "/((?!api(?!/auth)|_next/static|_next/image|favicon.ico).*)",
  ]
};

