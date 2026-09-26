import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Subdomain routing proxy.
 *
 * For admin subdomain (e.g. admin.stemedicaet.com or admin.localhost):
 * - Keeps /auth/*, /api/*, /media/* intact (never prefix with /admin)
 * - / -> rewrites to /admin
 * - /admin/* -> passes through as-is
 * - /posts, /catalogue, /stories, /proformas -> rewrites to /admin/*
 *
 * For main domain (stemedicaet.com / www.stemedicaet.com):
 * - Redirects /admin or /admin/* to https://admin.stemedicaet.com/admin/*
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname, search } = request.nextUrl;

  const isAdminSubdomain = host.startsWith("admin.");

  if (isAdminSubdomain) {
    // 1. Auth, API, media, and existing /admin routes must NOT be rewritten.
    if (
      pathname.startsWith("/auth") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/media") ||
      pathname.startsWith("/admin")
    ) {
      return NextResponse.next();
    }

    // 2. Root path on admin subdomain: rewrite to /admin
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }

    // 3. Admin sub-sections without /admin prefix (e.g. /posts -> /admin/posts)
    const adminSections = ["posts", "catalogue", "stories", "proformas"];
    const firstSegment = pathname.split("/")[1];
    if (adminSections.includes(firstSegment)) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // If accessing /admin on the main domain in production, redirect to the admin subdomain
  if (
    process.env.NODE_ENV === "production" &&
    !host.includes("localhost") &&
    !host.includes("127.0.0.1") &&
    !host.includes(".vercel.app") &&
    (pathname === "/admin" || pathname.startsWith("/admin/"))
  ) {
    const baseHost = host.replace(/^www\./, "");
    const adminHost = `admin.${baseHost}`;
    const targetUrl = new URL(
      `https://${adminHost}${pathname}${search}`
    );
    return NextResponse.redirect(targetUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on all paths except:
     * - _next/static (static assets)
     * - _next/image (image optimisation)
     * - public files (favicon, logo, icons, robots, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|apple-icon\\.png|icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
