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
  "/login",
  "/register",
  "/api/auth",
  "/about",
  "/contact",
  "/favicon.ico",
  "/_next"
];

// Root path needs special handling
const isRootPath = (path: string) => path === "/";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Processing: ${pathname}`);
  
  // Special case for the home page
  if (isRootPath(pathname)) {
    console.log(`[Middleware] Home page: ${pathname}`);
    return NextResponse.next();
  }
  
  // Check if it's a public route
  for (const route of publicRoutes) {
    if (pathname.startsWith(route)) {
      console.log(`[Middleware] Public route: ${pathname}`);
      return NextResponse.next();
    }
  }

  console.log(`[Middleware] Protected route: ${pathname}`);
  
  // Get the user's token and extract role
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  });
  
  console.log(`[Middleware] Token:`, token ? "exists" : "null", token?.role);
  
  // No token means user is not authenticated
  if (!token) {
    console.log(`[Middleware] No auth, redirecting to login`);
    // Redirect to login with callback URL to return after login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  const userRole = token.role as string || UserRole.PATIENT;
  console.log(`[Middleware] User role: ${userRole}`);
  
  // STRICT ROLE ENFORCEMENT:
  // Each user can only access their own role's routes
  
  // Admin routes - ONLY admins can access
  if (protectedRoutes.admin.test(pathname)) {
    console.log(`[Middleware] Admin route check`);
    if (userRole !== UserRole.ADMIN) {
      console.log(`[Middleware] Not admin, unauthorized`);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  // Patient routes - ONLY patients can access
  if (protectedRoutes.patient.test(pathname)) {
    console.log(`[Middleware] Patient route check`);
    if (userRole !== UserRole.PATIENT) {
      console.log(`[Middleware] Not patient, unauthorized`);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  // Physiotherapist routes - ONLY physiotherapists can access
  if (protectedRoutes.physiotherapist.test(pathname)) {
    console.log(`[Middleware] Physiotherapist route check`);
    if (userRole !== UserRole.PHYSIOTHERAPIST) {
      console.log(`[Middleware] Not physiotherapist, unauthorized`);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  // Receptionist routes - ONLY receptionists can access
  if (protectedRoutes.receptionist.test(pathname)) {
    console.log(`[Middleware] Receptionist route check`);
    if (userRole !== UserRole.RECEPTIONIST) {
      console.log(`[Middleware] Not receptionist, unauthorized`);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  // Dashboard access - redirect to role-specific dashboard
  if (pathname === "/dashboard") {
    const dashboardPath = `/${userRole.toLowerCase()}/dashboard`;
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Allow access if all checks pass
  console.log(`[Middleware] Access granted`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Explicitly protect these paths and their subpaths
    '/admin',
    '/admin/:path*',
    '/patient',
    '/patient/:path*',
    '/physiotherapist',
    '/physiotherapist/:path*',
    '/receptionist',
    '/receptionist/:path*',
    '/dashboard',
    '/dashboard/:path*'
  ]
};

