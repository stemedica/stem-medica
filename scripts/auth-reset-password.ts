import { Pool } from "pg";
import { z } from "zod";
import { resetAdminPassword } from "../src/lib/auth";

async function main() {
  const email = z.string().trim().toLowerCase().email().parse(process.env.AUTH_RESET_EMAIL);
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Configuration incomplete");
  if (process.stdin.isTTY) throw new Error("Pipe the password through stdin using the documented hidden prompt");
  let password = "";
  for await (const chunk of process.stdin) { password += chunk.toString(); if (password.length > 256) throw new Error("Invalid password"); }
  password = password.replace(/\r?\n$/, "");
  if (password.length < 10 || password.length > 128) throw new Error("Invalid password length");
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (!await resetAdminPassword(client, email, password)) throw new Error("Account not found");
    await client.query("COMMIT");
    console.log("Password reset. Existing sessions and legacy authenticator settings were removed.");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { password = ""; client.release(); await pool.end(); }
}
main().catch(() => { console.error("Password reset failed. Check the database, email, and password length. No secrets are logged."); process.exitCode = 1; });
