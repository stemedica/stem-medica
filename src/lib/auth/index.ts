import { createHash, randomBytes, randomUUID } from "node:crypto";
import { authDatabase, resilientQueryer } from "./database";
import { hashPassword, verifyPassword } from "./password";

export type AdminSession = {
  user: { id: string; email: string; name: string; twoFactorEnabled: boolean };
  session: { id: string; expiresAt: Date; mfaVerified: boolean };
};

export type Queryer = { query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> };
const SESSION_SECONDS = 8 * 60 * 60;
const DUMMY_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;

export const sessionCookieName = () => process.env.NODE_ENV === "production" ? "__Host-stem-admin" : "stem-admin";
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

function cookieValue(headers: Headers) {
  const name = `${sessionCookieName()}=`;
  return headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(name))?.slice(name.length) || "";
}

export function sessionCookie(token: string, maxAge = SESSION_SECONDS) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie() { return sessionCookie("", 0); }

export async function readSession(headers: Headers, database: Queryer = resilientQueryer(authDatabase().pool)): Promise<AdminSession | null> {
  const token = cookieValue(headers);
  if (!token) return null;
  const result = await database.query(`SELECT s.id AS "sessionId", s."expiresAt", s."mfaVerified", u.id AS "userId", u.email, u.name, COALESCE(u."twoFactorEnabled", false) AS "twoFactorEnabled"
    FROM auth_session s JOIN auth_user u ON u.id = s."userId"
    WHERE s.token = $1 AND s."expiresAt" > NOW() LIMIT 1`, [tokenHash(token)]);
  const row = result.rows[0];
  if (!row) return null;
  return { user: { id: String(row.userId), email: String(row.email), name: String(row.name), twoFactorEnabled: Boolean(row.twoFactorEnabled) },
    session: { id: String(row.sessionId), expiresAt: new Date(String(row.expiresAt)), mfaVerified: Boolean(row.mfaVerified) } };
}

export async function signIn(email: string, password: string, request: { ip?: string; userAgent?: string }, database: Queryer = authDatabase().pool) {
  const normalized = email.trim().toLowerCase();
  const result = await database.query(`SELECT u.id, u.email, u.name, COALESCE(u."twoFactorEnabled", false) AS "twoFactorEnabled", a.password
    FROM auth_user u LEFT JOIN auth_account a ON a."userId" = u.id AND a."providerId" = 'credential'
    WHERE lower(u.email) = $1 LIMIT 1`, [normalized]);
  const row = result.rows[0];
  const valid = await verifyPassword(typeof row?.password === "string" ? row.password : DUMMY_HASH, password);
  if (!row || !valid) return { ok: false as const, reason: "invalid" as const };
  if (row.twoFactorEnabled) return { ok: false as const, reason: "legacy-mfa" as const };

  const token = randomBytes(32).toString("base64url");
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await database.query(`INSERT INTO auth_session (id, token, "expiresAt", "userId", "ipAddress", "userAgent", "mfaVerified", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`, [id, tokenHash(token), expiresAt, row.id, request.ip || null, request.userAgent || null]);
  return { ok: true as const, token, expiresAt };
}

export async function signOut(headers: Headers, database: Queryer = authDatabase().pool) {
  const token = cookieValue(headers);
  if (token) await database.query("DELETE FROM auth_session WHERE token = $1", [tokenHash(token)]);
}

export async function checkRateLimit(identity: string, maximum: number, database: Queryer = authDatabase().pool) {
  const key = createHash("sha256").update(identity).digest("hex");
  const result = await database.query(`INSERT INTO auth_throttle (key, count, "expiresAt") VALUES ($1, 1, NOW() + INTERVAL '15 minutes')
    ON CONFLICT (key) DO UPDATE SET count = CASE WHEN auth_throttle."expiresAt" <= NOW() THEN 1 ELSE auth_throttle.count + 1 END,
    "expiresAt" = CASE WHEN auth_throttle."expiresAt" <= NOW() THEN EXCLUDED."expiresAt" ELSE auth_throttle."expiresAt" END RETURNING count`, [key]);
  return Number(result.rows[0]?.count) <= maximum;
}

export async function insertAdmin(database: Queryer, email: string, password: string, name = "STEM MEDICA administrator") {
  const userId = randomUUID();
  const now = new Date();
  await database.query(`INSERT INTO auth_user (id, name, email, "emailVerified", "twoFactorEnabled", "createdAt", "updatedAt") VALUES ($1, $2, $3, true, false, $4, $4)`, [userId, name, email.trim().toLowerCase(), now]);
  await database.query(`INSERT INTO auth_account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt") VALUES ($1, $2, 'credential', $2, $3, $4, $4)`, [randomUUID(), userId, await hashPassword(password), now]);
  return userId;
}

export async function resetAdminPassword(database: Queryer, email: string, password: string) {
  const result = await database.query(`UPDATE auth_account a SET password = $2, "updatedAt" = NOW() FROM auth_user u
    WHERE a."userId" = u.id AND a."providerId" = 'credential' AND lower(u.email) = lower($1) RETURNING u.id`, [email, await hashPassword(password)]);
  const userId = result.rows[0]?.id;
  if (!userId) return false;
  await database.query(`DELETE FROM auth_session WHERE "userId" = $1`, [userId]);
  await database.query(`UPDATE auth_user SET "twoFactorEnabled" = false, "updatedAt" = NOW() WHERE id = $1`, [userId]);
  await database.query(`DELETE FROM auth_two_factor WHERE "userId" = $1`, [userId]);
  return true;
}
