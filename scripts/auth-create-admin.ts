import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { createAdminAuth } from "../src/lib/auth/factory";
import { approvedAdmin } from "../src/lib/auth/policy";
import * as schema from "../src/lib/auth/schema";

// Password is read from stdin, not command-line arguments or printed output.
async function main() {
  const email = process.env.AUTH_CREATE_EMAIL?.trim().toLowerCase();
  const secret = process.env.BETTER_AUTH_SECRET, baseURL = process.env.BETTER_AUTH_URL, adminEmails = process.env.ADMIN_EMAILS;
  if (!email || !approvedAdmin(email) || !secret || secret.length < 32 || !baseURL || !adminEmails || !process.env.DATABASE_URL) throw new Error("Configuration incomplete");
  if (process.stdin.isTTY) throw new Error("Pipe the password through stdin using the documented hidden prompt");
  let password = "";
  for await (const chunk of process.stdin) { password += chunk.toString(); if (password.length > 256) throw new Error("Invalid password"); }
  password = password.replace(/\r?\n$/, "");
  if (password.length < 10 || password.length > 128) throw new Error("Invalid password length");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 });
  try {
    const db = drizzle(pool, { schema });
    if ((await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email))).length) throw new Error("Account already exists; this command never resets credentials");
    const auth = createAdminAuth({ database: drizzleAdapter(db, { provider: "pg", schema }), secret, baseURL, adminEmails, bootstrap: true, consumeTotp: async () => false });
    await auth.api.signUpEmail({ body: { email, password, name: "STEM MEDICA administrator" } });
    console.log("Approved admin created. Sign in with your email and password. Authenticator setup is optional under Security.");
  } finally { password = ""; await pool.end(); }
}
main().catch(() => { console.error("Admin creation failed. Check configuration, password length (10–128), and whether the account already exists. No secrets are logged."); process.exitCode = 1; });
