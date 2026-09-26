import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "us_admin_session";
const SECRET = process.env.ADMIN_SESSION_SECRET || "urban-spice-secret-key-2026";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    if (cookie !== SECRET) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
