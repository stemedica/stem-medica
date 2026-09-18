import { Pool } from "pg";
import { z } from "zod";
import { insertAdmin } from "../src/lib/auth";

async function readPassword() {
  if (process.stdin.isTTY) throw new Error("Pipe the password through stdin using the documented hidden prompt");
  let password = "";
  for await (const chunk of process.stdin) { password += chunk.toString(); if (password.length > 256) throw new Error("Invalid password"); }
  password = password.replace(/\r?\n$/, "");
  if (password.length < 10 || password.length > 128) throw new Error("Invalid password length");
  return password;
}

async function main() {
  const email = z.string().trim().toLowerCase().email().parse(process.env.AUTH_CREATE_EMAIL);
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Configuration incomplete");
  let password = await readPassword();
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10_000 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if ((await client.query("SELECT id FROM auth_user WHERE lower(email) = lower($1) LIMIT 1", [email])).rows.length) throw new Error("Account already exists");
    await insertAdmin(client, email, password);
    await client.query("COMMIT");
    console.log("Admin created. Sign in with the email and password you supplied.");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { password = ""; client.release(); await pool.end(); }
}
main().catch(() => { console.error("Admin creation failed. Check the database, email, password length, and whether the account already exists. No secrets are logged."); process.exitCode = 1; });
