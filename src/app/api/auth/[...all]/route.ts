import { z } from "zod";
import { checkRateLimit, clearSessionCookie, readSession, sessionCookie, signIn, signOut } from "@/lib/auth";
import { requestBytes } from "@/lib/admin-api";

const reply = (status: number, message: string, extra?: HeadersInit) => Response.json({ message }, { status, headers: { "Cache-Control": "no-store", ...extra } });

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const expectedProtocol = process.env.VERCEL ? "https:" : new URL(request.url).protocol;
    return parsed.protocol === expectedProtocol && parsed.host === request.headers.get("host");
  } catch { return false; }
}

async function handler(request: Request) {
  const path = new URL(request.url).pathname.slice("/api/auth".length);
  if (request.method === "GET" && path === "/get-session") {
    try { return Response.json(await readSession(request.headers), { headers: { "Cache-Control": "private, no-store" } }); }
    catch { return reply(503, "Sign-in is temporarily unavailable. Please try again."); }
  }
  if (request.method !== "POST" || !["/sign-in/email", "/sign-out"].includes(path)) return reply(404, "Not available");
  if (!sameOrigin(request)) return reply(403, "Invalid request origin");

  try {
    if (path === "/sign-out") {
      await signOut(request.headers);
      return reply(200, "Signed out", { "Set-Cookie": clearSessionCookie() });
    }
    let body;
    try { body = z.object({ email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(1).max(128) })
      .parse(JSON.parse((await requestBytes(request, 4_000)).toString())); }
    catch { return reply(400, "Enter a valid email and password."); }
    const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!await checkRateLimit(`login:ip:${ip}`, 30) || !await checkRateLimit(`login:email:${body.email}`, 10)) return reply(429, "Too many attempts. Please wait before trying again.");
    const result = await signIn(body.email, body.password, { ip, userAgent: request.headers.get("user-agent") || undefined });
    if (!result.ok) return result.reason === "legacy-mfa"
      ? reply(409, "This account needs a password reset before it can use the new sign-in.")
      : reply(401, "Invalid email or password.");
    return Response.json({ signedIn: true }, { headers: { "Cache-Control": "private, no-store", "Set-Cookie": sessionCookie(result.token) } });
  } catch { return reply(503, "Sign-in is temporarily unavailable. Please try again."); }
}
export const GET = handler;
export const POST = handler;
