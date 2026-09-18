import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import { and, desc, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { contentDocuments as documents, enquiries, enquiryThrottle } from "./content-schema";
import type { EnquiryInput } from "./enquiry";

let connection: ReturnType<typeof connect> | undefined;
function connect() {
  const connectionString = process.env.CMS_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("CMS database is not configured");
  const pool = new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    query_timeout: 15_000,
    statement_timeout: 15_000,
    keepAlive: true,
  });
  if (process.env.VERCEL) attachDatabasePool(pool);
  return { pool, db: drizzle(pool) };
}
export const contentDatabase = () => connection ??= connect();

function transientReadFailure(error: unknown) {
  const failure = error as { code?: string; message?: string; cause?: { code?: string } };
  return [failure.code, failure.cause?.code].some((code) => ["ETIMEDOUT", "ECONNRESET", "EPIPE", "57P01", "57P02", "57P03"].includes(code || ""))
    || /connection terminated|timeout|socket closed/i.test(failure.message || "");
}

async function retryRead<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (!transientReadFailure(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 150));
    return operation();
  }
}

export async function readDocument(key: string) {
  const [row] = await retryRead(() => contentDatabase().db.select().from(documents).where(eq(documents.key, key)));
  return row ? { bytes: Buffer.from(JSON.stringify(row.data)), etag: row.revision } : null;
}
export async function writeDocument(key: string, data: unknown, expected: string | null) {
  const revision = randomUUID();
  const db = contentDatabase().db;
  const rows = expected === null
    ? await db.insert(documents).values({ key, data, revision }).onConflictDoNothing().returning({ key: documents.key })
    : await db.update(documents).set({ data, revision, updatedAt: new Date() })
      .where(and(eq(documents.key, key), eq(documents.revision, expected))).returning({ key: documents.key });
  return rows.length ? revision : null;
}
export async function listDocuments(prefix: string) {
  return retryRead(() => contentDatabase().db.select({ pathname: documents.key, uploadedAt: documents.updatedAt }).from(documents)
    .where(sql`starts_with(${documents.key}, ${prefix})`));
}
export async function deleteDocument(key: string, revision: string) {
  const rows = await contentDatabase().db.delete(documents)
    .where(and(eq(documents.key, key), eq(documents.revision, revision))).returning({ key: documents.key });
  return rows.length > 0;
}

export async function createEnquiry(input: EnquiryInput, clientKey: string, userAgent: string | null) {
  const db = contentDatabase().db;
  const allowed = await db.transaction(async (tx) => {
    const [row] = await tx.insert(enquiryThrottle).values({
      key: clientKey,
      count: 1,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    }).onConflictDoUpdate({
      target: enquiryThrottle.key,
      set: {
        count: sql`CASE WHEN ${enquiryThrottle.expiresAt} <= NOW() THEN 1 ELSE ${enquiryThrottle.count} + 1 END`,
        expiresAt: sql`CASE WHEN ${enquiryThrottle.expiresAt} <= NOW() THEN NOW() + INTERVAL '1 hour' ELSE ${enquiryThrottle.expiresAt} END`,
      },
    }).returning({ count: enquiryThrottle.count });
    if (!row || row.count > 5) return false;
    await tx.insert(enquiries).values({
      id: randomUUID(),
      ...input,
      email: input.email || null,
      quantity: input.quantity ?? null,
      notes: input.notes || null,
      clientKey,
      userAgent: userAgent?.slice(0, 500) || null,
    });
    return true;
  });
  return allowed;
}

export async function listEnquiries(limit = 100) {
  return retryRead(() => contentDatabase().db.select({
    id: enquiries.id,
    facility: enquiries.facility,
    contact: enquiries.contact,
    phone: enquiries.phone,
    email: enquiries.email,
    equipment: enquiries.equipment,
    quantity: enquiries.quantity,
    notes: enquiries.notes,
    status: enquiries.status,
    createdAt: enquiries.createdAt,
  }).from(enquiries).orderBy(desc(enquiries.createdAt)).limit(Math.min(Math.max(limit, 1), 100)));
}
