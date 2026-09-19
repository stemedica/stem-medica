import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import { and, eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { contentDocuments as documents } from "./content-schema";

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
