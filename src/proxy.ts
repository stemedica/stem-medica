import { NextResponse, type NextRequest } from "next/server";

// Pages and APIs verify sessions. Never challenge with browser Basic authentication.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const path = request.nextUrl.pathname;
  const adminSurface = path.startsWith("/test/admin") || path.startsWith("/test/auth") || (host.startsWith("admin.") && path === "/");
  if (adminSurface && process.env.BETTER_AUTH_URL) {
    const canonical = new URL(process.env.BETTER_AUTH_URL);
    if (host !== canonical.host) return NextResponse.redirect(new URL(path + request.nextUrl.search, canonical));
  }
  if (host.startsWith("admin.") && path === "/") return NextResponse.redirect(new URL("/test/admin", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
