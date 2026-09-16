import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { authDatabase } from "@/lib/auth/database";
import { hasAdminAccess } from "@/lib/auth/policy";
import { requestBytes } from "@/lib/admin-api";

const allowed = new Set(["/get-session", "/sign-in/email", "/sign-out", "/two-factor/enable", "/two-factor/verify-totp", "/two-factor/verify-backup-code", "/two-factor/generate-backup-codes", "/change-password", "/revoke-sessions"]);
const reply = (status: number, message: string) => Response.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
async function handler(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname.slice("/test/api/auth".length);
  if (!allowed.has(path) || (request.method === "GET" && path !== "/get-session")) return reply(404, "Not available");
  try {
    const configured = new URL(process.env.BETTER_AUTH_URL!);
    // Next may construct request.url with its internal listener hostname.
    // Validate the incoming Host against our fixed origin, never forwarded headers.
    if (request.headers.get("host") !== configured.host) return reply(403, "Use the configured admin login address.");
    const canonicalURL = new URL(url.pathname + url.search, configured.origin);
    let forwarded = new Request(canonicalURL, { method: request.method, headers: request.headers });
    if (["/two-factor/generate-backup-codes", "/change-password", "/revoke-sessions"].includes(path)) {
      const session = await getAuth().api.getSession({ headers: request.headers, query: { disableCookieCache: true } });
      if (!hasAdminAccess(session)) return reply(401, "Complete authenticator verification first.");
    }
    if (request.method === "POST") {
      if (request.headers.get("origin") !== configured.origin) return reply(403, "Invalid request origin");
      const bytes = await requestBytes(request, 16000);
      let body;
      try { body = JSON.parse(bytes.toString()); } catch { return reply(400, "Invalid request body"); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return reply(400, "Invalid request body");
      if (body.trustDevice || body.disableSession) return reply(400, "This sign-in option is not supported");
      const secret = process.env.BETTER_AUTH_SECRET!;
      const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "local";
      // Global budget also limits distributed attempts and missing/spoofed IP headers.
      const { db } = authDatabase();
      for (const [identity, max] of [[`ip:${ip ?? "unknown"}`, 30], ["global", 200]] as const) {
        const key = createHmac("sha256", secret).update(identity).digest("hex");
        const result = await db.execute(sql`INSERT INTO auth_throttle (key, count, "expiresAt") VALUES (${key}, 1, NOW() + INTERVAL '15 minutes') ON CONFLICT (key) DO UPDATE SET count = CASE WHEN auth_throttle."expiresAt" <= NOW() THEN 1 ELSE auth_throttle.count + 1 END, "expiresAt" = CASE WHEN auth_throttle."expiresAt" <= NOW() THEN EXCLUDED."expiresAt" ELSE auth_throttle."expiresAt" END RETURNING count`);
        if (Number(result.rows[0]?.count) > max) return reply(429, "Too many attempts. Please try again in 15 minutes.");
      }
      await db.execute(sql`DELETE FROM auth_throttle WHERE "expiresAt" < NOW() - INTERVAL '1 day'`);
      await db.execute(sql`DELETE FROM auth_otp_use WHERE "expiresAt" < NOW()`);
      forwarded = new Request(canonicalURL, { method: "POST", headers: request.headers, body: bytes.toString() });
    }
    const response = await getAuth().handler(forwarded);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return reply(503, "Sign-in is temporarily unavailable. Please try again.");
  }
}
export const GET = handler;
export const POST = handler;
