import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth");

  // Boleh akses /api/auth (buat login)
  if (isApiAuth) return NextResponse.next();

  // Belum login & bukan di /login → redirect ke /login
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Udah login & buka /login → redirect ke dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect semua kecuali: _next, api/auth, static files, offline
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon-|manifest.json|sw.js|offline).*)",
  ],
};