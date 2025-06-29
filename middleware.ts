import { NextResponse } from 'next/server';
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';

// This function will be executed for each matching request
export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    // Get the pathname from the URL
    const { pathname } = request.nextUrl;
    const isAuthenticated = !!request.nextauth?.token;
    
    // PROTECTED ROUTES - Always require authentication
    const isProtectedRoute = 
      pathname.startsWith('/user') || 
      pathname.startsWith('/admin') ||
      pathname.startsWith('/orders') ||
      pathname.startsWith('/appointments') ||
      pathname.startsWith('/checkout');
    
    // If trying to access protected route without being logged in, redirect to login
    // Exclude /user from this check since we want to allow unauthenticated access to /user
    if (!isAuthenticated && isProtectedRoute && pathname !== '/user') {
      console.log('Redirecting unauthenticated user from protected route to login');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Get the user's role from the token
    const userRole = request.nextauth?.token?.role;
    
    // Redirect admin users trying to access user pages
    if (userRole === 'ADMIN' && pathname.startsWith('/user')) {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    }
    
    // Redirect patient users trying to access admin pages
    if (userRole === 'PATIENT' && pathname.startsWith('/admin')) {
      const userUrl = new URL('/user', request.url);
      return NextResponse.redirect(userUrl);
    }
    
    // Handle homepage access
    if (pathname === '/') {
      // If user is authenticated, redirect based on role
      if (isAuthenticated) {
        if (userRole === 'ADMIN') {
          const adminUrl = new URL('/admin', request.url);
          return NextResponse.redirect(adminUrl);
        } else if (userRole === 'PATIENT') {
          const userUrl = new URL('/user', request.url);
          return NextResponse.redirect(userUrl);
        }
      } else {
        // If not authenticated, redirect to user page
        const userUrl = new URL('/user', request.url);
        return NextResponse.redirect(userUrl);
      }
    }
    
    // Redirect authenticated users without proper role
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
    
    // For /user path, allow unauthenticated users but redirect authenticated non-patients
    if (pathname.startsWith('/user') && isAuthenticated && userRole !== 'PATIENT') {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
    
    // If no redirects needed, continue with the request
    return NextResponse.next();
  },
  {
    callbacks: {
      // Run middleware for all requests, regardless of authentication status
      authorized: () => true,
    },
  }
);

export const config = {
  // Apply middleware to these paths
  matcher: [
    // Protect admin and user routes
    '/admin/:path*', 
    '/user/:path*',
    // Protected user-specific routes
    '/orders/:path*',
    '/products/:path*',
    '/appointments/:path*',
    '/checkout/:path*',
    // Process the home route for redirections
    '/'
  ]
}