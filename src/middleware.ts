import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";
import type { JwtPayload } from "jsonwebtoken";

// 1️⃣ Define your token type
interface MyTokenPayload extends JwtPayload {
  id: string;
  role: string;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) return NextResponse.redirect(new URL("/auth/login", request.url));

  // 2️⃣ Cast the decoded token to your custom type
  const user = verifyToken(token) as MyTokenPayload | null;

  if (!user) return NextResponse.redirect(new URL("/auth/login", request.url));

  // 3️⃣ Role-based routing
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dashboard/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (path.startsWith("/dashboard/station") && user.role !== "STATION") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (path.startsWith("/dashboard/driver") && user.role !== "DRIVER") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};