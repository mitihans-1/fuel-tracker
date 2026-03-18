import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // If no token → go to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Verify token early in middleware
  const decoded = verifyToken(token);
  if (!decoded) {
    // If token is invalid → clear it and go to login
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};