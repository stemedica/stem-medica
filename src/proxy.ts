import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next 16 renamed `middleware.ts` to `proxy.ts`. Same behaviour, new convention.
 *
 * Two jobs:
 *   1. Serve /admin when the request arrives on the admin subdomain, so
 *      admin.stemedicaet.com shows the proforma builder and nothing else.
 *   2. Gate /admin behind HTTP Basic auth.
 *
 * Basic auth is deliberate rather than ideal. Vercel's platform-level password
 * protection is a Pro feature, so on the Hobby plan the gate has to live in the
 * app. It is enough to keep the page out of public hands and off search engines;
 * it is not a user system. See docs/ADMIN.md.
 */
const ADMIN_HOSTS = ["admin."];

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="STEM MEDICA admin", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

function isAuthorised(request: NextRequest): boolean {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  // Fail closed: with no credentials configured the admin is unreachable
  // rather than wide open.
  if (!user || !pass) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const i = decoded.indexOf(":");
  if (i < 0) return false;

  return decoded.slice(0, i) === user && decoded.slice(i + 1) === pass;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const onAdminHost = ADMIN_HOSTS.some((h) => host.startsWith(h));
  const { pathname } = request.nextUrl;

  // The admin subdomain serves only the admin.
  if (onAdminHost) {
    if (!isAuthorised(request)) return unauthorized();
    if (pathname.startsWith("/admin")) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // /admin also works on the main domain, which is how it is reachable on
  // *.vercel.app previews where there is no custom subdomain.
  if (pathname.startsWith("/admin")) {
    if (!isAuthorised(request)) return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  // Without a matcher this runs on every request including static assets, which
  // would put the auth check in front of CSS, JS and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
