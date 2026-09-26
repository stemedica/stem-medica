import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Subdomain routing proxy.
 *
 * admin.stemedicaet.com/* → rewrites to /admin/*
 * admin.stemedicaet.com/  → rewrites to /admin
 *
 * Everything else passes through unchanged.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // Match admin.stemedicaet.com or admin.localhost (local dev)
  const isAdminSubdomain = host.startsWith("admin.");

  if (isAdminSubdomain && !pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on all paths except:
     * - _next/static  (built assets)
     * - _next/image   (image optimisation)
     * - public files  (favicon, logo, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|apple-icon.png|icon.png).*)",
  ],
};
