import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // If no token → go to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // NOTE: We only check for the existence of the token here.
  // The actual verification happens in the Dashboard via /api/auth/me,
  // because jsonwebtoken is not compatible with the Edge Runtime.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};