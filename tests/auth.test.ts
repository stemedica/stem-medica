import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { clearSessionCookie, insertAdmin, readSession, resetAdminPassword, sessionCookie, signIn, signOut, type Queryer } from "../src/lib/auth";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";

test("password hashes remain compatible and reject malformed values", async () => {
  const hash = await hashPassword("Test12345!");
  assert.equal(await verifyPassword(hash, "Test12345!"), true);
  assert.equal(await verifyPassword(hash, "wrong password"), false);
  assert.equal(await verifyPassword("not-a-hash", "Test12345!"), false);
});

test("Neon-style database sessions are hashed, expire, revoke, and reset safely", async () => {
  const client = new PGlite();
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  const database = client as unknown as Queryer;
  try {
    await insertAdmin(database, "admin@example.test", "Test12345!", "Test admin");
    assert.equal((await signIn("admin@example.test", "wrong password", {}, database)).ok, false);
    const login = await signIn("ADMIN@example.test", "Test12345!", { ip: "127.0.0.1" }, database);
    assert.equal(login.ok, true);
    if (!login.ok) return;
    const cookie = sessionCookie(login.token);
    assert.doesNotMatch(cookie, new RegExp(login.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
    const stored = await client.query<{ token: string }>("SELECT token FROM auth_session LIMIT 1");
    assert.notEqual(stored.rows[0].token, login.token);
    const headers = new Headers({ cookie: cookie.split(";")[0] });
    assert.equal((await readSession(headers, database))?.user.email, "admin@example.test");
    await signOut(headers, database);
    assert.equal(await readSession(headers, database), null);
    assert.match(clearSessionCookie(), /Max-Age=0/);

    await client.query('UPDATE auth_user SET "twoFactorEnabled" = true');
    assert.deepEqual(await signIn("admin@example.test", "Test12345!", {}, database), { ok: false, reason: "legacy-mfa" });
    assert.equal(await resetAdminPassword(database, "admin@example.test", "Replacement123!"), true);
    assert.equal((await signIn("admin@example.test", "Replacement123!", {}, database)).ok, true);
  } finally { await client.close(); }
});
