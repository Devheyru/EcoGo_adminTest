import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session");

  // Define protected routes
  // We protect everything by default except public routes
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isPublicAsset = request.nextUrl.pathname.includes("."); // simplistic check for files
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth");

  // If it's a static asset or API auth route, let it pass
  if (isPublicAsset || isApiAuth) {
    return NextResponse.next();
  }

  // If user is on login page and has session, redirect to dashboard
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is NOT on login page and has NO session, redirect to login
  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
