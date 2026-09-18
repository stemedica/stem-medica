import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { createOTP } from "@better-auth/utils/otp";
import { base32 } from "@better-auth/utils/base32";
import { createAdminAuth } from "../src/lib/auth/factory";
import { hasAdminAccess } from "../src/lib/auth/policy";
import * as schema from "../src/lib/auth/schema";

test("password login works without MFA; opting in enforces codes, rejects replay and revokes sessions", async () => {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  const used = new Set<string>();
  const config = { database: drizzleAdapter(db, { provider: "pg", schema }), secret: "test-only-auth-secret-with-more-than-32-characters", baseURL: "http://localhost:3001", adminEmails: "admin@example.test",
    consumeTotp: async (id: string, code: string) => { const key = `${id}:${code}`; if (used.has(key)) return false; used.add(key); return true; } };
  const bootstrap = createAdminAuth({ ...config, bootstrap: true });
  const password = "Test12345!"; // Exactly ten characters.
  await assert.rejects(bootstrap.api.signUpEmail({ body: { email: config.adminEmails, password: "TooShort!", name: "Test admin" } }));
  await bootstrap.api.signUpEmail({ body: { email: config.adminEmails, password, name: "Test admin" } });
  const auth = createAdminAuth(config);
  const jars = new Map<string, Map<string, string>>();
  async function call(path: string, body?: object, jarName = "main") {
    const jar = jars.get(jarName) ?? new Map<string, string>(); jars.set(jarName, jar);
    const response = await auth.handler(new Request(`${config.baseURL}/api/auth${path}`, {
      method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", Origin: config.baseURL, "x-forwarded-for": "127.0.0.1", Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join("; ") }, body: body ? JSON.stringify(body) : undefined,
    }));
    for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(";"); const split = pair.indexOf("="); jar.set(pair.slice(0, split), pair.slice(split + 1)); }
    return { status: response.status, body: await response.json() };
  }
  try {
    assert.equal((await call("/sign-up/email", { email: "other@example.test", password, name: "Other" })).status, 400);
    assert.equal((await call("/sign-in/email", { email: "other@example.test", password })).status, 401);
    assert.equal((await call("/sign-in/email", { email: config.adminEmails, password })).status, 200);
    const before = (await call("/get-session")).body;
    assert.equal(hasAdminAccess(before, config.adminEmails), true);
    // Opting in invalidates access for old password-only sessions.
    await call("/sign-in/email", { email: config.adminEmails, password }, "old");
    const enrol = await call("/two-factor/enable", { password, method: "totp" });
    assert.equal(enrol.status, 200);
    const secret = new TextDecoder().decode(base32.decode(new URL(enrol.body.totpURI).searchParams.get("secret")!));
    const code = await createOTP(secret).totp();
    const verified = await call("/two-factor/verify-totp", { code });
    assert.equal(verified.status, 200);
    assert.equal(hasAdminAccess((await call("/get-session")).body, config.adminEmails), true);
    assert.equal(hasAdminAccess((await call("/get-session", undefined, "old")).body, config.adminEmails), false);
    await call("/sign-out", {});
    assert.equal((await call("/get-session")).body, null);
    const login = await call("/sign-in/email", { email: config.adminEmails, password });
    assert.equal(login.body.twoFactorRedirect, true);
    assert.equal((await call("/get-session")).body, null);
    assert.equal((await call("/two-factor/verify-totp", { code })).status, 401);
    assert.equal((await call("/get-session")).body, null);
    await call("/sign-in/email", { email: config.adminEmails, password });
    assert.equal((await call("/two-factor/verify-backup-code", { code: enrol.body.backupCodes[0] })).status, 200);
    assert.equal(hasAdminAccess((await call("/get-session")).body, config.adminEmails), true);
    assert.equal((await call("/two-factor/disable", { password })).status, 403);
    assert.equal((await call("/two-factor/verify-backup-code", { code: enrol.body.backupCodes[0] })).status, 401);
    assert.equal((await call("/two-factor/verify-totp", { code, trustDevice: true })).status, 403);
    await call("/sign-out", {});
    assert.equal((await call("/get-session")).body, null);
  } finally { await client.close(); }
});
