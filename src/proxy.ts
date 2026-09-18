import { NextResponse, type NextRequest } from "next/server";

// Pages and APIs verify sessions. Never challenge with browser Basic authentication.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const path = request.nextUrl.pathname;
  if (host.startsWith("admin.") && path === "/") return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
