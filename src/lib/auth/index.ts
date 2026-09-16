import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { authDatabase } from "./database";
import { createAdminAuth } from "./factory";
import * as schema from "./schema";

let instance: ReturnType<typeof createAdminAuth> | undefined;
export function getAuth() {
  if (instance) return instance;
  const secret = process.env.BETTER_AUTH_SECRET, baseURL = process.env.BETTER_AUTH_URL, adminEmails = process.env.ADMIN_EMAILS;
  if (!secret || secret.length < 32 || !baseURL || !adminEmails) throw new Error("Authentication configuration is incomplete");
  if (process.env.VERCEL && !baseURL.startsWith("https://")) throw new Error("Authentication requires HTTPS");
  const { db } = authDatabase();
  instance = createAdminAuth({ database: drizzleAdapter(db, { provider: "pg", schema }), secret, baseURL, adminEmails,
    consumeTotp: async (userId, code) => {
      const key = createHmac("sha256", secret).update(`${userId}:${code}`).digest("hex");
      const result = await db.execute(sql`INSERT INTO auth_otp_use (key, "expiresAt") VALUES (${key}, NOW() + INTERVAL '2 minutes') ON CONFLICT (key) DO UPDATE SET "expiresAt" = EXCLUDED."expiresAt" WHERE auth_otp_use."expiresAt" <= NOW() RETURNING key`);
      return result.rows.length === 1;
    },
  });
  return instance;
}
