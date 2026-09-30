import { type NextRequest, NextResponse } from "next/server";
import { NAME_COOKIE, UID_COOKIE } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

// Pages that DON'T need a username yet
const OPEN_PATHS = ["/setup", "/_next", "/api", "/favicon.ico", "/uploads"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow open paths through
  if (OPEN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if user has set their username
  const uid = request.cookies.get(UID_COOKIE)?.value;
  const name = request.cookies.get(NAME_COOKIE)?.value;

  // If no identity → redirect to setup page
  if (!uid || !name) {
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
