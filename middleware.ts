import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that don't require authentication or profile completion
const publicPaths = ["/login", "/register", "/", "/about", "/contact"];

// Paths that require patient profile
const patientPaths = ["/appointments", "/dashboard/patient", "/treatments"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths and API routes
  // Also skip Next.js internal routes like _next
  if (
    publicPaths.some(path => pathname.startsWith(path)) || 
    pathname.startsWith('/api/') ||
    pathname.includes('/_next/') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }
  
  // Get the JWT token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Debug log - use this to verify your middleware is running
  console.log("MIDDLEWARE RUNNING:", {
    path: pathname,
    hasToken: !!token,
    tokenData: token ? {
      id: token.id,
      email: token.email,
      role: token.role,
      hasPatientProfile: token.hasPatientProfile
    } : null
  });
  
  // If no token, redirect to login
  if (!token) {
    console.log("No token, redirecting to login");
    const url = new URL(`/login`, request.url);
    url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
  
  // Check if:
  // 1. User is a PATIENT
  // 2. User is trying to access a patient-specific path
  // 3. User doesn't have a patient profile
  if (token.role === "PATIENT" && 
      patientPaths.some(path => pathname.startsWith(path)) && 
      token.hasPatientProfile === false) {
    
    console.log("Patient needs profile, redirecting to register");
    
    // Prevent redirect loops - don't redirect if already on register page
    if (!pathname.startsWith('/register')) {
      const url = new URL(`/register`, request.url);
      url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Improved matcher configuration
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * - API routes (/api/*)
     * - Static files (_next/static/*, _next/image/*)
     * - Favicon, robots.txt and similar
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};

