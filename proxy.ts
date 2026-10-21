import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/register";
  const isApiAuth = path.startsWith("/api/auth");
  const isApiRegister = path === "/api/register";
  const isPublicFile =
    path.startsWith("/_next") ||
    path.startsWith("/icons/") ||
    path === "/favicon.ico" ||
    path === "/manifest.json" ||
    path === "/sw.js" ||
    path.startsWith("/offline");

  // 1. Bolehin akses ke API auth, register, dan file statis
  if (isApiAuth || isApiRegister || isPublicFile) {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth;

  // 2. Belum login tapi maksa masuk halaman utama -> tendang ke /login
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Udah login tapi buka /login atau /register -> lempar ke dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 4. Sisanya jalan normal
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|offline).*)",
  ],
};