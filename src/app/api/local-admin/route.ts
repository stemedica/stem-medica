import { timingSafeEqual } from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { z } from "zod";
import { authDatabase } from "@/lib/auth/database";
import { createAdminAuth } from "@/lib/auth/factory";
import { approvedAdmin } from "@/lib/auth/policy";
import { localSetupEnabled, localSetupToken } from "@/lib/auth/local-setup";
import * as schema from "@/lib/auth/schema";
import { json, requestBytes } from "@/lib/admin-api";

export async function POST(request: Request) {
  if (!localSetupEnabled()) return json({ error: "Not found" }, 404);
  const origin = new URL(process.env.BETTER_AUTH_URL!);
  if (request.headers.get("host") !== origin.host || request.headers.get("origin") !== origin.origin) return json({ error: "Invalid origin" }, 403);
  const token = Buffer.from(request.headers.get("x-local-setup") ?? "");
  const expected = Buffer.from(localSetupToken());
  if (token.length !== expected.length || !timingSafeEqual(token, expected)) return json({ error: "Reload the setup page and try again." }, 403);
  let body;
  try {
    body = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(10).max(128) }).parse(JSON.parse((await requestBytes(request, 4000)).toString()));
  } catch { return json({ error: "Use a valid email and a password of 10–128 characters." }, 400); }
  if (!approvedAdmin(body.email)) return json({ error: "Use the approved administrator email." }, 403);
  const client = await authDatabase().pool.connect();
  try {
    await client.query("BEGIN");
    // Serialize first-account creation, including across concurrent requests.
    await client.query("SELECT pg_advisory_xact_lock(73194021)");
    const db = drizzle(client, { schema });
    if ((await db.select({ id: schema.user.id }).from(schema.user).limit(1)).length) {
      await client.query("ROLLBACK");
      return json({ error: "Setup is complete. Sign in with your existing account." }, 409);
    }
    const auth = createAdminAuth({ database: drizzleAdapter(db, { provider: "pg", schema }),
      secret: process.env.BETTER_AUTH_SECRET!, baseURL: origin.origin, adminEmails: process.env.ADMIN_EMAILS!,
      bootstrap: true, consumeTotp: async () => false });
    await auth.api.signUpEmail({ body: { ...body, name: "STEM MEDICA administrator" } });
    await client.query("COMMIT");
    return json({ created: true }, 201);
  } catch {
    await client.query("ROLLBACK");
    return json({ error: "Account creation failed. Please retry." }, 503);
  } finally { client.release(); }
}
